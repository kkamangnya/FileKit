use crate::types::{CommandResult, OperationSummary};

#[allow(dead_code)]
pub trait DocumentConverterAdapter {
    fn convert(&self) -> CommandResult<OperationSummary>;
}

#[allow(dead_code)]
pub struct ExternalOfficeAdapter;

impl DocumentConverterAdapter for ExternalOfficeAdapter {
    fn convert(&self) -> CommandResult<OperationSummary> {
        Err("Office document conversion adapter is scaffolded for external engine integration".into())
    }
}
