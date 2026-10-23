#!/usr/bin/env bash
set -e

# INFO: Setup script to register Ozaspen as a local desktop application.
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BIN_PATH=""

if [ -f "$REPO_DIR/target/release/ozaspen" ]; then
    BIN_PATH="$REPO_DIR/target/release/ozaspen"
elif [ -f "$REPO_DIR/target/debug/ozaspen" ]; then
    BIN_PATH="$REPO_DIR/target/debug/ozaspen"
else
    echo "Binary not found in target/debug or target/release."
    echo "Building debug binary..."
    cargo build -p ozaspen
    BIN_PATH="$REPO_DIR/target/debug/ozaspen"
fi

# Ensure user directories exist
mkdir -p "$HOME/.local/bin"
mkdir -p "$HOME/.local/share/applications"

# Link executable to ~/.local/bin
ln -sf "$BIN_PATH" "$HOME/.local/bin/ozaspen"
echo "Linked binary: $BIN_PATH -> $HOME/.local/bin/ozaspen"

# Link desktop entry to applications folder
DESKTOP_SRC="$REPO_DIR/assets/ozaspen.desktop"
DESKTOP_DEST="$HOME/.local/share/applications/ozaspen.desktop"

if [ -f "$DESKTOP_SRC" ]; then
    ln -sf "$DESKTOP_SRC" "$DESKTOP_DEST"
    echo "Linked desktop entry: $DESKTOP_SRC -> $DESKTOP_DEST"
else
    echo "Error: $DESKTOP_SRC not found."
    exit 1
fi

# Refresh desktop database if available
if command -v update-desktop-database >/dev/null 2>&1; then
    update-desktop-database "$HOME/.local/share/applications" 2>/dev/null || true
    echo "Updated desktop database."
fi

echo "Ozaspen desktop application setup complete!"
echo "You can now launch 'Ozaspen' from your application menu or run 'ozaspen' in your terminal."
