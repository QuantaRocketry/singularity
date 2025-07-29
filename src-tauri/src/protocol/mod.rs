use serde::{Deserialize, Serialize};
use std::error::Error;

pub mod marcus;

pub trait ProtocolTrait: Send {
    fn parse_to_string(&self, bytes: &[u8]) -> String;
}

#[derive(Default, Serialize, Deserialize, Debug, PartialEq, Clone, Copy)]
pub enum Protocol {
    #[default]
    None,
}
