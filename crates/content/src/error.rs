use thiserror::Error;

#[derive(Debug, Error)]
pub enum ContentError {
    #[error("failed to encode sticky notes: {0}")]
    Encode(String),

    #[error("failed to decode sticky notes: {0}")]
    Decode(String),

    #[error(
        "unsupported sticky notes format version {found}; this build supports version {supported}"
    )]
    UnsupportedVersion { found: u32, supported: u32 },
}
