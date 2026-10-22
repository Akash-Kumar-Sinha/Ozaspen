use chrono::{DateTime, Local, Utc};
use egui::{
    Align, Button, Color32, CornerRadius, CursorIcon, FontId, Frame, Id, Layout, Margin, Order,
    Rect, RichText, Sense, Stroke, TextEdit, Ui, UiBuilder, pos2, vec2,
};
use ozaspen_content::{MIN_NOTE_HEIGHT, MIN_NOTE_WIDTH, NoteColor, NoteId, NoteLayout};

use crate::{
    DraftNote, FocusField, clamp_to_board,
    theme::{
        CARD_CORNER_RADIUS, DESTRUCTIVE, NOTE_TEXT, NOTE_TEXT_MUTED, note_border, note_fill,
        note_header_fill,
    },
};

const HEADER_HEIGHT: f32 = 44.0;
const BODY_PADDING: f32 = 10.0;
const RESIZE_HANDLE_SIZE: f32 = 16.0;

pub(crate) struct CardInput<'a> {
    pub id: &'a NoteId,
    pub color: NoteColor,
    pub updated_at: DateTime<Utc>,
    pub layout: NoteLayout,
    pub draft: &'a mut DraftNote,
    pub selected: bool,
    pub focus: Option<FocusField>,
    pub board_rect: Rect,
}

#[derive(Debug, Default)]
pub(crate) struct CardOutcome {
    pub selected: bool,
    pub bring_to_front: bool,
    pub close: bool,
    pub delete_requested: bool,
    pub share_requested: bool,
    pub content_changed: bool,
    pub layout: Option<NoteLayout>,
}

pub(crate) fn layer_id(id: &NoteId) -> egui::LayerId {
    egui::LayerId::new(Order::Middle, Id::unique(("sticky-note", id.as_str())))
}

pub(crate) fn show(ctx: &egui::Context, input: CardInput<'_>) -> CardOutcome {
    let order_id = layer_id(input.id).id;
    let position = pos2(input.layout.x, input.layout.y);
    let width = input.layout.width;
    let height = input.layout.height;
    let fill = note_fill(input.color);
    let border = if input.selected {
        Stroke::new(2.0, Color32::from_rgb(0xff, 0xff, 0xff))
    } else {
        Stroke::new(1.0, note_border(input.color))
    };

    egui::Area::new(order_id)
        .order(Order::Middle)
        .fixed_pos(position)
        .show(ctx, move |ui| {
            Frame::new()
                .fill(fill)
                .stroke(border)
                .corner_radius(CornerRadius::same(CARD_CORNER_RADIUS))
                .inner_margin(Margin::ZERO)
                .show(ui, |ui| {
                    ui.set_min_size(vec2(width, height));
                    ui.set_max_width(width);
                    draw_card(ui, input)
                })
                .inner
        })
        .inner
}

fn draw_card(ui: &mut Ui, mut input: CardInput<'_>) -> CardOutcome {
    let mut outcome = CardOutcome::default();
    let mut layout = input.layout;
    let mut layout_changed = false;
    let width = layout.width;

    let card_rect = Rect::from_min_size(ui.min_rect().min, vec2(width, layout.height));
    let card_click = ui.interact(
        card_rect,
        Id::unique(("sticky-note-card", input.id.as_str())),
        Sense::click(),
    );
    if card_click.contains_pointer() && ui.input(|input| input.pointer.any_pressed()) {
        outcome.selected = true;
        outcome.bring_to_front = true;
    }

    let (header_rect, _) = ui.allocate_exact_size(vec2(width, HEADER_HEIGHT), Sense::hover());
    ui.painter().rect_filled(
        header_rect,
        CornerRadius {
            nw: CARD_CORNER_RADIUS,
            ne: CARD_CORNER_RADIUS,
            sw: 0,
            se: 0,
        },
        note_header_fill(input.color),
    );

    let drag_response = ui.interact(
        header_rect,
        Id::unique(("sticky-note-drag", input.id.as_str())),
        Sense::click_and_drag(),
    );
    if drag_response.drag_started() || drag_response.clicked() {
        outcome.selected = true;
        outcome.bring_to_front = true;
    }
    if drag_response.dragged() {
        let delta = drag_response.drag_delta();
        layout.x += delta.x;
        layout.y += delta.y;
        layout = clamp_to_board(layout, input.board_rect);
        layout_changed = true;
    }

    draw_header(ui, &mut input, header_rect, &mut outcome);
    draw_body(ui, &mut input, &mut outcome);
    draw_resize_handle(ui, &input, &mut layout, &mut layout_changed, &mut outcome);

    if layout_changed {
        outcome.layout = Some(clamp_to_board(layout, input.board_rect));
    }

    outcome
}

fn draw_header(
    ui: &mut Ui,
    input: &mut CardInput<'_>,
    header_rect: Rect,
    outcome: &mut CardOutcome,
) {
    ui.visuals_mut().weak_text_color = Some(NOTE_TEXT);
    ui.scope_builder(
        UiBuilder::new()
            .max_rect(header_rect.shrink2(vec2(10.0, 7.0)))
            .layout(Layout::left_to_right(Align::Center)),
        |ui| {
            let (grip_rect, _) = ui.allocate_exact_size(vec2(14.0, 20.0), Sense::hover());
            let grip_color = Color32::from_rgba_unmultiplied(24, 24, 27, 110);
            let center = grip_rect.center();
            for row in 0..3 {
                for col in 0..2 {
                    let offset = vec2(col as f32 * 4.0 - 2.0, row as f32 * 4.0 - 4.0);
                    ui.painter().circle_filled(center + offset, 1.4, grip_color);
                }
            }

            let title_width = (ui.available_width() - 152.0).max(48.0);
            let title_response = ui.add_sized(
                vec2(title_width, 22.0),
                TextEdit::singleline(&mut input.draft.title)
                    .id(Id::unique(("sticky-note-title", input.id.as_str())))
                    .frame(Frame::NONE)
                    .margin(Margin::ZERO)
                    .text_color(NOTE_TEXT)
                    .font(FontId::proportional(15.0))
                    .char_limit(120)
                    .hint_text("Untitled"),
            );
            if title_response.changed() {
                outcome.content_changed = true;
            }
            if title_response.clicked() || title_response.has_focus() {
                outcome.selected = true;
            }
            if input.focus == Some(FocusField::Title) {
                title_response.request_focus();
            }

            ui.label(
                RichText::new(updated_label(input.updated_at))
                    .size(9.5)
                    .color(NOTE_TEXT_MUTED),
            );

            let share = ui.add(
                Button::new(RichText::new("Share").size(11.0).color(NOTE_TEXT_MUTED))
                    .frame(false)
                    .small(),
            );
            if share
                .on_hover_text("Copy a portable link to this note")
                .clicked()
            {
                outcome.share_requested = true;
            }

            let delete = ui.add(
                Button::new(RichText::new("Delete").size(10.5).color(DESTRUCTIVE))
                    .frame(false)
                    .small(),
            );
            if delete.on_hover_text("Delete this note").clicked() {
                outcome.delete_requested = true;
            }

            let close = ui.add(
                Button::new(RichText::new("×").size(18.0).color(NOTE_TEXT_MUTED))
                    .frame(false)
                    .small(),
            );
            if close.on_hover_text("Close note").clicked() {
                outcome.close = true;
            }
        },
    );
}

fn draw_body(ui: &mut Ui, input: &mut CardInput<'_>, outcome: &mut CardOutcome) {
    ui.visuals_mut().weak_text_color = Some(NOTE_TEXT);
    let body_height = (input.layout.height - HEADER_HEIGHT - BODY_PADDING * 2.0).max(60.0);

    Frame::new()
        .inner_margin(Margin::symmetric(12, BODY_PADDING as i8))
        .show(ui, |ui| {
            ui.set_width(input.layout.width - 24.0);
            let body_response = ui.add_sized(
                vec2(input.layout.width - 24.0, body_height),
                TextEdit::multiline(&mut input.draft.body)
                    .id(Id::unique(("sticky-note-body", input.id.as_str())))
                    .frame(Frame::NONE)
                    .margin(Margin::ZERO)
                    .text_color(NOTE_TEXT)
                    .font(FontId::proportional(14.0))
                    .desired_width(input.layout.width - 24.0)
                    .hint_text("Write something…"),
            );
            if body_response.changed() {
                outcome.content_changed = true;
            }
            if body_response.clicked() || body_response.has_focus() {
                outcome.selected = true;
            }
            if input.focus == Some(FocusField::Body) {
                body_response.request_focus();
            }
        });
}

fn draw_resize_handle(
    ui: &mut Ui,
    input: &CardInput<'_>,
    layout: &mut NoteLayout,
    layout_changed: &mut bool,
    outcome: &mut CardOutcome,
) {
    let card_rect = ui.min_rect();
    let handle_rect = Rect::from_min_size(
        pos2(
            card_rect.right() - RESIZE_HANDLE_SIZE,
            card_rect.bottom() - RESIZE_HANDLE_SIZE,
        ),
        vec2(RESIZE_HANDLE_SIZE, RESIZE_HANDLE_SIZE),
    );

    let response = ui.interact(
        handle_rect,
        Id::unique(("sticky-note-resize", input.id.as_str())),
        Sense::click_and_drag(),
    );

    if response.drag_started() || response.clicked() {
        outcome.selected = true;
        outcome.bring_to_front = true;
    }
    if response.dragged() {
        let delta = response.drag_delta();
        let max_width = (input.board_rect.right() - layout.x).max(MIN_NOTE_WIDTH);
        let max_height = (input.board_rect.bottom() - layout.y).max(MIN_NOTE_HEIGHT);
        layout.width = (layout.width + delta.x).clamp(MIN_NOTE_WIDTH, max_width);
        layout.height = (layout.height + delta.y).clamp(MIN_NOTE_HEIGHT, max_height);
        *layout_changed = true;
    }

    if response.hovered() || response.dragged() {
        ui.ctx().set_cursor_icon(CursorIcon::ResizeNwSe);
    }

    let grip = Color32::from_rgba_unmultiplied(52, 52, 59, 150);
    for index in 0..3 {
        let offset = 4.0 + index as f32 * 4.0;
        ui.painter().line_segment(
            [
                pos2(handle_rect.right() - offset, handle_rect.bottom() - 2.0),
                pos2(handle_rect.right() - 2.0, handle_rect.bottom() - offset),
            ],
            Stroke::new(1.0, grip),
        );
    }
}

fn updated_label(updated_at: DateTime<Utc>) -> String {
    let elapsed = Utc::now().signed_duration_since(updated_at);
    let seconds = elapsed.num_seconds();

    if seconds < 60 {
        "just now".to_owned()
    } else if seconds < 3_600 {
        format!("{}m ago", seconds / 60)
    } else if seconds < 86_400 {
        format!("{}h ago", seconds / 3_600)
    } else {
        updated_at.with_timezone(&Local).format("%b %d").to_string()
    }
}
