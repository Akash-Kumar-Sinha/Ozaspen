use std::collections::{BTreeSet, HashMap};
use std::time::{Duration, Instant};

use chrono::Local;
use egui::{
    Align, Align2, Button, CentralPanel, Color32, CornerRadius, Frame, Key, Label, Layout, Margin,
    Panel, Rect, RichText, ScrollArea, Sense, Stroke, TextEdit, UiBuilder, Vec2, ViewportCommand,
    Window, vec2,
};
use ozaspen_content::{
    DEFAULT_NOTE_HEIGHT, DEFAULT_NOTE_WIDTH, MIN_NOTE_WIDTH, NoteId, NoteLayout, StickyNote,
};
use ozaspen_core::NotesService;
use p2p::{P2p, P2pEvent};

use crate::{
    DraftNote, FocusField, card,
    theme::{BACKGROUND, BORDER, DESTRUCTIVE, FOREGROUND, MUTED, SURFACE, SURFACE_RAISED, WARNING},
};

const AUTOSAVE_DELAY: Duration = Duration::from_millis(800);
const SAVE_RETRY_DELAY: Duration = Duration::from_secs(5);
const SIDEBAR_ROW_HEIGHT: f32 = 30.0;
const FLOW_GAP: f32 = 20.0;
const FLOW_PADDING: f32 = 24.0;

enum SaveStatus {
    Saved,
    Unsaved,
    Error(String),
}

impl SaveStatus {
    fn label(&self) -> &str {
        match self {
            Self::Saved => "All changes saved",
            Self::Unsaved => "Unsaved changes",
            Self::Error(_) => "Save failed",
        }
    }

    fn color(&self) -> Color32 {
        match self {
            Self::Saved => MUTED,
            Self::Unsaved => WARNING,
            Self::Error(_) => DESTRUCTIVE,
        }
    }

    fn error(&self) -> Option<&str> {
        match self {
            Self::Error(error) => Some(error),
            _ => None,
        }
    }
}

struct SidebarEntry {
    id: NoteId,
    title: String,
    updated: String,
}

struct LiveShareDialog {
    note_id: NoteId,
    session: Option<u64>,
    ticket: String,
    join_input: String,
    status: String,
    peers: usize,
    is_host: bool,
}

impl LiveShareDialog {
    fn new(note_id: NoteId) -> Self {
        Self {
            note_id,
            session: None,
            ticket: String::new(),
            join_input: String::new(),
            status: "Start a share or join a ticket.".to_owned(),
            peers: 0,
            is_host: false,
        }
    }
}

fn peer_status(peers: usize) -> String {
    if peers == 1 {
        "1 collaborator connected".to_owned()
    } else {
        format!("{peers} collaborators connected")
    }
}

/// The native sticky-notes workspace: sidebar, toolbar, and free-floating cards.
pub struct StickyNotesBoard {
    service: NotesService,
    drafts: HashMap<NoteId, DraftNote>,
    open_notes: BTreeSet<NoteId>,
    selected: Option<NoteId>,
    focus_request: Option<(NoteId, FocusField)>,
    delete_confirmation: Option<NoteId>,
    status: SaveStatus,
    autosave_deadline: Option<Instant>,
    close_save_failed: bool,
    p2p: P2p,
    live_share: Option<LiveShareDialog>,
    topmost_note: Option<NoteId>,
    board_rect: Rect,
}

impl StickyNotesBoard {
    #[must_use]
    pub fn new(mut service: NotesService) -> Self {
        let status = match service.load() {
            Ok(()) => SaveStatus::Saved,
            Err(error) => SaveStatus::Error(error.to_string()),
        };

        let drafts = service
            .notes()
            .iter()
            .map(|note| (note.id.clone(), DraftNote::from(note)))
            .collect();
        let open_notes = service.notes().iter().map(|note| note.id.clone()).collect();

        Self {
            service,
            drafts,
            open_notes,
            selected: None,
            focus_request: None,
            delete_confirmation: None,
            status,
            autosave_deadline: None,
            close_save_failed: false,
            p2p: P2p::new(),
            live_share: None,
            topmost_note: None,
            board_rect: Rect::from_min_size(egui::pos2(0.0, 0.0), vec2(1280.0, 800.0)),
        }
    }

    #[must_use]
    pub fn is_dirty(&self) -> bool {
        self.service.is_dirty()
    }

    /// Flushes unsaved changes. Returns `true` when the document is clean.
    pub fn save(&mut self) -> bool {
        if !self.service.is_dirty() {
            self.status = SaveStatus::Saved;
            self.autosave_deadline = None;
            return true;
        }

        match self.service.save() {
            Ok(()) => {
                self.status = SaveStatus::Saved;
                self.autosave_deadline = None;
                self.close_save_failed = false;
                true
            }
            Err(error) => {
                self.status = SaveStatus::Error(error.to_string());
                self.autosave_deadline = Some(Instant::now() + SAVE_RETRY_DELAY);
                false
            }
        }
    }

    pub fn ui(&mut self, ui: &mut egui::Ui) {
        let ctx = ui.ctx().clone();
        self.process_p2p_events(&ctx);

        let mut new_requested = false;
        let mut save_requested = false;
        ctx.input(|input| {
            if input.modifiers.command || input.modifiers.ctrl {
                new_requested |= input.key_pressed(Key::N);
                save_requested |= input.key_pressed(Key::S);
            }
        });

        let note_count = self.service.notes().len();
        let mut new_clicked = false;
        let mut save_clicked = false;
        Panel::top("ozaspen-top-bar")
            .frame(
                Frame::new()
                    .fill(BACKGROUND)
                    .inner_margin(Margin::symmetric(16, 10))
                    .stroke(Stroke::new(1.0, BORDER)),
            )
            .show(ui, |ui| {
                ui.horizontal(|ui| {
                    ui.label(RichText::new("OzasPen").size(17.0).strong());
                    ui.label(RichText::new("Sticky Notes").size(12.0).color(MUTED));
                    ui.label(
                        RichText::new(format!("· {note_count} notes"))
                            .size(11.0)
                            .color(MUTED),
                    );

                    ui.with_layout(Layout::right_to_left(Align::Center), |ui| {
                        if ui
                            .add(
                                Button::new(
                                    RichText::new("+ New note").size(12.0).color(BACKGROUND),
                                )
                                .fill(FOREGROUND),
                            )
                            .clicked()
                        {
                            new_clicked = true;
                        }
                        if ui
                            .add(Button::new(RichText::new("Save").size(12.0)).frame(false))
                            .on_hover_text("Save now (Ctrl+S)")
                            .clicked()
                        {
                            save_clicked = true;
                        }

                        let status = ui.label(
                            RichText::new(self.status.label())
                                .size(11.0)
                                .color(self.status.color()),
                        );
                        if let Some(error) = self.status.error() {
                            status.on_hover_text(error);
                            ui.label(RichText::new("Storage error").size(11.0).color(DESTRUCTIVE));
                        }
                    });
                });

                if let Some(error) = self.status.error() {
                    ui.add_space(2.0);
                    ui.label(
                        RichText::new(format!("Could not save changes: {error}"))
                            .size(11.0)
                            .color(DESTRUCTIVE),
                    );
                }
            });

        new_requested |= new_clicked;
        save_requested |= save_clicked;

        let sidebar_entries = self.sidebar_entries();
        let mut clicked_note: Option<NoteId> = None;
        Panel::left("ozaspen-notes-sidebar")
            .resizable(true)
            .default_size(232.0)
            .size_range(180.0..=340.0)
            .frame(
                Frame::new()
                    .fill(SURFACE)
                    .inner_margin(Margin::symmetric(12, 12))
                    .stroke(Stroke::new(1.0, BORDER)),
            )
            .show(ui, |ui| {
                ui.label(RichText::new("NOTES").size(10.0).strong().color(MUTED));
                ui.add_space(4.0);

                if sidebar_entries.is_empty() {
                    ui.label(
                        RichText::new("No notes yet.\nCreate one to get started.")
                            .size(12.0)
                            .color(MUTED),
                    );
                } else {
                    ScrollArea::vertical()
                        .auto_shrink([false, false])
                        .show(ui, |ui| {
                            for entry in &sidebar_entries {
                                let is_selected = self.selected.as_ref() == Some(&entry.id);
                                let is_open = self.open_notes.contains(&entry.id);
                                let color = if is_open { FOREGROUND } else { MUTED };
                                let (row_rect, response) = ui.allocate_exact_size(
                                    vec2(ui.available_width(), SIDEBAR_ROW_HEIGHT),
                                    Sense::click(),
                                );
                                if is_selected || response.hovered() {
                                    let fill = if is_selected {
                                        SURFACE_RAISED
                                    } else {
                                        Color32::from_rgb(0x11, 0x11, 0x13)
                                    };
                                    ui.painter()
                                        .rect_filled(row_rect, CornerRadius::same(4), fill);
                                }

                                let text_rect = row_rect.shrink2(vec2(8.0, 0.0));
                                ui.new_child(
                                    UiBuilder::new()
                                        .max_rect(text_rect)
                                        .layout(Layout::left_to_right(Align::Center)),
                                )
                                .add(
                                    Label::new(RichText::new(&entry.title).size(13.0).color(color))
                                        .truncate()
                                        .selectable(false),
                                );

                                if response
                                    .on_hover_text(format!(
                                        "{} · last updated {}",
                                        entry.title, entry.updated
                                    ))
                                    .clicked()
                                {
                                    clicked_note = Some(entry.id.clone());
                                }
                            }
                        });
                }
            });

        let mut board_rect = self.board_rect;
        CentralPanel::default()
            .frame(Frame::new().fill(BACKGROUND).inner_margin(Margin::ZERO))
            .show(ui, |ui| {
                board_rect = ui.max_rect();
                if self.service.notes().is_empty() {
                    ui.centered_and_justified(|ui| {
                        ui.label(
                            RichText::new(
                                "Create your first sticky note with the New note button.",
                            )
                            .size(13.0)
                            .color(MUTED),
                        );
                    });
                }
            });
        self.board_rect = board_rect;

        if new_requested {
            self.create_note();
        }
        if let Some(id) = clicked_note {
            self.open_note(id);
        }

        self.draw_notes(&ctx, board_rect);
        self.show_delete_confirmation(&ctx);
        self.show_live_share(&ctx);

        if save_requested {
            self.save();
        } else {
            self.tick_autosave(&ctx);
        }

        if ctx.input(|input| input.viewport().close_requested()) {
            if self.close_save_failed || !self.save() {
                self.close_save_failed = true;
                ctx.send_viewport_cmd(ViewportCommand::CancelClose);
            }
        } else {
            self.close_save_failed = false;
        }
    }

    fn create_note(&mut self) {
        let id = self.service.create_note(NoteLayout::new(0.0, 0.0));
        if let Some(note) = self.service.note(&id) {
            self.drafts.insert(id.clone(), DraftNote::from(note));
        }
        self.open_notes.insert(id.clone());
        self.selected = Some(id.clone());
        self.focus_request = Some((id.clone(), FocusField::Title));
        self.reflow_open_notes();
        self.service.bring_to_front(&id);
        self.mark_dirty();
    }

    fn open_note(&mut self, id: NoteId) {
        let was_open = self.open_notes.contains(&id);
        self.open_notes.insert(id.clone());
        self.selected = Some(id.clone());
        self.focus_request = Some((id.clone(), FocusField::Body));

        let mut changed = false;
        if !was_open {
            changed |= self.reflow_open_notes();
        }
        changed |= self.service.bring_to_front(&id);
        if changed {
            self.mark_dirty();
        }
    }

    fn close_note(&mut self, id: &NoteId) {
        self.open_notes.remove(id);
        if self.selected.as_ref() == Some(id) {
            self.selected = None;
        }
        if self.reflow_open_notes() {
            self.mark_dirty();
        }
    }

    fn reflow_open_notes(&mut self) -> bool {
        let board = self.board_rect;
        if board.width() <= 1.0 || board.height() <= 1.0 {
            return false;
        }

        let padding = FLOW_PADDING.min(board.width() / 4.0);
        let usable_width = (board.width() - padding * 2.0).max(MIN_NOTE_WIDTH);
        let note_width = DEFAULT_NOTE_WIDTH.min(usable_width);
        let note_height = DEFAULT_NOTE_HEIGHT;
        let columns =
            (((usable_width + FLOW_GAP) / (note_width + FLOW_GAP)).floor() as usize).max(1);

        let open_ids: Vec<NoteId> = self
            .service
            .notes()
            .iter()
            .filter(|note| self.open_notes.contains(&note.id))
            .map(|note| note.id.clone())
            .collect();

        let mut changed = false;
        for (index, id) in open_ids.iter().enumerate() {
            let column = index % columns;
            let row = index / columns;
            let x = board.left() + padding + column as f32 * (note_width + FLOW_GAP);
            let y = board.top() + padding + row as f32 * (note_height + FLOW_GAP);

            let Some(note) = self.service.note(id) else {
                continue;
            };
            let mut layout = note.layout;
            layout.x = x;
            layout.y = y;
            layout.width = note_width;
            layout.height = note_height;
            layout.z_index = (index as u32).saturating_add(1);
            if self.service.update_layout(id, layout) {
                changed = true;
            }
        }

        changed
    }

    fn delete_note(&mut self, id: &NoteId) {
        if !self.service.delete_note(id) {
            return;
        }
        if self
            .live_share
            .as_ref()
            .is_some_and(|dialog| &dialog.note_id == id)
        {
            self.p2p.stop();
            self.live_share = None;
        }

        self.drafts.remove(id);
        self.open_notes.remove(id);
        if self.selected.as_ref() == Some(id) {
            self.selected = None;
        }
        self.mark_dirty();
    }

    fn mark_dirty(&mut self) {
        self.status = SaveStatus::Unsaved;
        self.autosave_deadline = Some(Instant::now() + AUTOSAVE_DELAY);
    }

    fn tick_autosave(&mut self, ctx: &egui::Context) {
        if !self.service.is_dirty() {
            self.autosave_deadline = None;
            return;
        }

        let due = self.autosave_deadline.unwrap_or_else(Instant::now);
        if Instant::now() >= due && !self.save() {
            // `save` already scheduled a bounded retry.
        }

        if let Some(due) = self.autosave_deadline {
            let remaining = due.saturating_duration_since(Instant::now());
            ctx.request_repaint_after(remaining.max(Duration::from_millis(16)));
        }
    }

    fn draw_notes(&mut self, ctx: &egui::Context, board_rect: Rect) {
        let mut ordered: Vec<(u32, NoteId)> = self
            .service
            .notes()
            .iter()
            .map(|note| (note.layout.z_index, note.id.clone()))
            .collect();
        ordered.sort_by_key(|(z_index, _)| *z_index);

        let focus_request = self.focus_request.take();
        let mut changed = false;
        let mut selected_now = None;
        let mut bring_to_front = Vec::new();
        let mut close_now = None;
        let mut delete_now = None;
        let mut share_now = None;

        for (_, id) in ordered {
            if !self.open_notes.contains(&id) {
                continue;
            }

            let (color, updated_at, layout) = match self.service.note(&id) {
                Some(note) => (note.color, note.updated_at, note.layout),
                None => continue,
            };

            let clamped = crate::clamp_to_board(layout, board_rect);
            if clamped != layout && self.service.update_layout(&id, clamped) {
                changed = true;
            }

            if !self.drafts.contains_key(&id)
                && let Some(note) = self.service.note(&id)
            {
                self.drafts.insert(id.clone(), DraftNote::from(note));
            }

            let focus = match &focus_request {
                Some((focus_id, field)) if focus_id == &id => Some(*field),
                _ => None,
            };

            let outcome = {
                let Some(draft) = self.drafts.get_mut(&id) else {
                    continue;
                };
                card::show(
                    ctx,
                    card::CardInput {
                        id: &id,
                        color,
                        updated_at,
                        layout: clamped,
                        draft,
                        selected: self.selected.as_ref() == Some(&id),
                        focus,
                        board_rect,
                    },
                )
            };

            if outcome.content_changed
                && let Some(draft) = self.drafts.get(&id)
            {
                let title = draft.title.clone();
                let body = draft.body.clone();
                if self.service.update_text(&id, &title, &body) {
                    changed = true;
                }
            }

            if let Some(new_layout) = outcome.layout
                && self.service.update_layout(&id, new_layout)
            {
                changed = true;
            }
            if outcome.selected {
                selected_now = Some(id.clone());
            }
            if outcome.bring_to_front {
                bring_to_front.push(id.clone());
            }
            if outcome.close {
                close_now = Some(id);
                continue;
            }
            if outcome.delete_requested {
                delete_now = Some(id.clone());
            }
            if outcome.share_requested {
                share_now = Some(id);
            }
        }

        for id in bring_to_front {
            if self.service.bring_to_front(&id) {
                changed = true;
            }
        }
        if let Some(id) = selected_now {
            self.selected = Some(id);
        }
        if let Some(id) = close_now {
            self.close_note(&id);
        }
        if let Some(id) = delete_now {
            self.delete_confirmation = Some(id);
        }
        if let Some(id) = share_now {
            self.share_note(&id);
        }

        let topmost = self
            .service
            .notes()
            .iter()
            .filter(|note| self.open_notes.contains(&note.id))
            .max_by_key(|note| note.layout.z_index)
            .map(|note| note.id.clone());
        if topmost != self.topmost_note {
            if let Some(id) = &topmost {
                ctx.move_to_top(card::layer_id(id));
            }
            self.topmost_note = topmost;
        }

        if changed {
            self.mark_dirty();
            self.publish_live_note();
        }
    }

    fn share_note(&mut self, id: &NoteId) {
        self.live_share = Some(LiveShareDialog::new(id.clone()));
    }

    fn publish_live_note(&self) {
        let Some(dialog) = &self.live_share else {
            return;
        };
        if dialog.session.is_none() {
            return;
        }
        if let Some(note) = self.service.note(&dialog.note_id) {
            self.p2p.publish(note.clone());
        }
    }

    fn process_p2p_events(&mut self, ctx: &egui::Context) {
        let events = self.p2p.poll();
        for event in events {
            match event {
                P2pEvent::Ticket {
                    session,
                    note_id,
                    ticket,
                } => {
                    if let Some(dialog) = self.live_share.as_mut()
                        && dialog.session == Some(session)
                    {
                        dialog.note_id = note_id;
                        dialog.ticket = ticket;
                        if dialog.is_host {
                            dialog.status = if dialog.peers == 0 {
                                "Waiting for collaborators…".to_owned()
                            } else {
                                peer_status(dialog.peers)
                            };
                        } else {
                            dialog.status = "Connecting to host…".to_owned();
                        }
                    }
                }
                P2pEvent::Connected { session, peers } => {
                    if let Some(dialog) = self.live_share.as_mut()
                        && dialog.session == Some(session)
                    {
                        dialog.peers = peers;
                        dialog.status = if dialog.is_host {
                            "Waiting for collaborators…".to_owned()
                        } else {
                            "Connected to host".to_owned()
                        };
                    }
                }
                P2pEvent::Peers { session, peers } => {
                    if let Some(dialog) = self.live_share.as_mut()
                        && dialog.session == Some(session)
                    {
                        dialog.peers = peers;
                        dialog.status = if dialog.is_host {
                            if peers == 0 {
                                "Waiting for collaborators…".to_owned()
                            } else {
                                peer_status(peers)
                            }
                        } else if peers <= 1 {
                            "Connected to host".to_owned()
                        } else {
                            peer_status(peers)
                        };
                    }
                }
                P2pEvent::RemoteNote { session, note } => {
                    if self
                        .live_share
                        .as_ref()
                        .is_some_and(|dialog| dialog.session == Some(session))
                    {
                        self.apply_remote_note(note);
                    }
                }
                P2pEvent::Error { session, message } => {
                    if let Some(dialog) = self.live_share.as_mut()
                        && dialog.session == Some(session)
                    {
                        dialog.session = None;
                        dialog.peers = 0;
                        dialog.status = format!("Error: {message}");
                    }
                }
                P2pEvent::Stopped { session } => {
                    if let Some(dialog) = self.live_share.as_mut()
                        && dialog.session == Some(session)
                    {
                        dialog.session = None;
                        dialog.peers = 0;
                        if !dialog.status.starts_with("Error:") {
                            dialog.status = "Session ended.".to_owned();
                        }
                    }
                }
            }
        }

        if self.live_share.is_some() {
            ctx.request_repaint_after(Duration::from_millis(100));
        }
    }

    fn apply_remote_note(&mut self, note: StickyNote) {
        let id = note.id.clone();
        let was_open = self.open_notes.contains(&id);
        if !self.service.upsert_note(note) {
            return;
        }

        if let Some(note) = self.service.note(&id) {
            let draft = DraftNote::from(note);
            self.drafts.insert(id.clone(), draft);
        }
        self.open_notes.insert(id.clone());
        self.selected = Some(id.clone());
        if !was_open {
            self.reflow_open_notes();
        }
        self.mark_dirty();
    }

    fn show_live_share(&mut self, ctx: &egui::Context) {
        let Some(current) = self.live_share.as_ref() else {
            return;
        };
        let note_id = current.note_id.clone();
        let note_title = self
            .service
            .note(&note_id)
            .map(StickyNote::display_title)
            .unwrap_or("Shared note")
            .to_owned();

        let mut start = false;
        let mut join = false;
        let mut stop = false;
        let mut open = true;
        let mut copy_ticket = None;

        if let Some(dialog) = self.live_share.as_mut() {
            Window::new("Live share")
                .collapsible(false)
                .resizable(false)
                .open(&mut open)
                .anchor(Align2::CENTER_CENTER, Vec2::ZERO)
                .show(ctx, |ui| {
                    ui.set_min_width(470.0);
                    ui.label(RichText::new(note_title).size(16.0).strong());
                    ui.add_space(4.0);

                    if dialog.session.is_none() {
                        ui.label(
                            RichText::new(
                                "Create a ticket to let another person open and edit this note live.",
                            )
                            .size(12.0)
                            .color(MUTED),
                        );
                        ui.add_space(8.0);
                        if ui.button("Create share link").clicked() {
                            start = true;
                        }

                        ui.add_space(10.0);
                        ui.separator();
                        ui.add_space(6.0);
                        ui.label(RichText::new("Join a shared note").size(12.0).strong());
                        ui.add(
                            TextEdit::singleline(&mut dialog.join_input)
                                .hint_text("Paste an OzasPen ticket")
                                .desired_width(f32::INFINITY),
                        );
                        ui.add_space(4.0);
                        if ui.button("Join").clicked() {
                            join = true;
                        }
                    } else {
                        ui.label(
                            RichText::new(
                                "Send this ticket to a collaborator. Keep this window open while you work.",
                            )
                            .size(12.0)
                            .color(MUTED),
                        );
                        ui.add_space(6.0);

                        let mut ticket = dialog.ticket.clone();
                        if ticket.is_empty() {
                            ui.label(
                                RichText::new("Starting the share session…")
                                    .size(12.0)
                                    .color(WARNING),
                            );
                        } else {
                            ui.add(
                                TextEdit::multiline(&mut ticket)
                                    .desired_rows(3)
                                    .desired_width(f32::INFINITY)
                                    .font(egui::TextStyle::Monospace)
                                    .interactive(false),
                            );
                            if ui.button("Copy ticket").clicked() {
                                copy_ticket = Some(dialog.ticket.clone());
                            }
                        }

                        ui.add_space(6.0);
                        ui.label(
                            RichText::new(&dialog.status)
                                .size(12.0)
                                .color(if dialog.status.starts_with("Error:") {
                                    DESTRUCTIVE
                                } else {
                                    FOREGROUND
                                }),
                        );
                        ui.add_space(8.0);
                        if ui.button("Stop sharing").clicked() {
                            stop = true;
                        }
                    }
                });

            if copy_ticket.is_some() {
                dialog.status = "Ticket copied".to_owned();
            }
        }

        if start {
            let Some(note) = self.service.note(&note_id).cloned() else {
                return;
            };
            let session = self.p2p.start_share(note);
            if let Some(dialog) = self.live_share.as_mut() {
                dialog.session = Some(session);
                dialog.is_host = true;
                dialog.ticket.clear();
                dialog.peers = 0;
                dialog.status = "Starting share…".to_owned();
            }
        }

        if join {
            let ticket = self
                .live_share
                .as_ref()
                .map(|dialog| dialog.join_input.trim().to_owned())
                .unwrap_or_default();
            if !ticket.is_empty() {
                let session = self.p2p.join(ticket.clone());
                if let Some(dialog) = self.live_share.as_mut() {
                    dialog.session = Some(session);
                    dialog.is_host = false;
                    dialog.ticket = ticket;
                    dialog.peers = 0;
                    dialog.status = "Connecting to host…".to_owned();
                }
            }
        }

        if let Some(ticket) = copy_ticket {
            ctx.copy_text(ticket);
        }

        if stop || !open {
            self.p2p.stop();
            self.live_share = None;
        }
    }

    fn sidebar_entries(&self) -> Vec<SidebarEntry> {
        self.service
            .notes()
            .iter()
            .map(|note| SidebarEntry {
                id: note.id.clone(),
                title: truncate(note.display_title(), 28),
                updated: note
                    .updated_at
                    .with_timezone(&Local)
                    .format("%b %d, %H:%M")
                    .to_string(),
            })
            .collect()
    }

    fn show_delete_confirmation(&mut self, ctx: &egui::Context) {
        let Some(id) = self.delete_confirmation.clone() else {
            return;
        };
        let title = self
            .service
            .note(&id)
            .map(StickyNote::display_title)
            .unwrap_or("this note")
            .to_owned();

        let mut cancel = false;
        let mut confirm = false;
        Window::new("Delete sticky note")
            .collapsible(false)
            .resizable(false)
            .anchor(Align2::CENTER_CENTER, Vec2::ZERO)
            .show(ctx, |ui| {
                ui.label(format!("Delete \"{title}\"? This cannot be undone."));
                ui.add_space(8.0);
                ui.horizontal(|ui| {
                    if ui.button("Cancel").clicked() {
                        cancel = true;
                    }
                    if ui
                        .add(
                            Button::new(RichText::new("Delete").color(DESTRUCTIVE))
                                .fill(Color32::from_rgb(0x2a, 0x10, 0x10)),
                        )
                        .clicked()
                    {
                        confirm = true;
                    }
                });
            });

        if confirm {
            self.delete_note(&id);
            self.delete_confirmation = None;
        } else if cancel {
            self.delete_confirmation = None;
        }
    }
}

fn truncate(value: &str, max_chars: usize) -> String {
    let mut chars = value.chars();
    let truncated: String = chars.by_ref().take(max_chars).collect();
    if chars.next().is_some() {
        format!("{truncated}…")
    } else {
        truncated
    }
}
