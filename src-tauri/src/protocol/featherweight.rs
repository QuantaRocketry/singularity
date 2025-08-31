// use std::str::FromStr;

use std::string::ParseError;

use crate::protocol::ProtocolTrait;

#[derive(Debug, PartialEq)]
pub enum TelemetryData {
    FlightTime(u16),
    Altitude100(u16),
    Altitude(u32),
    Velocity(i16),
    Acceleration(f32),
    FlightPhase(FlightPhase),
    Channels(u8),
    ChannelFired(u8),
    Temperature(f32),
    Name(String),
    BatteryVoltage(f32),
    Apogee(u32),
    MaxVelocity(u16),
    MaxAcceleration(u16),
    Unknown(char, String),
}

#[derive(Debug, PartialEq, Clone, Copy)]
pub enum FlightPhase {
    WaitingForLaunch,
    LaunchDetected,
    LowVelocityDetected,
    NoseOver,
    DrogueFired,
    MainFired,
    FailsafeTriggered,
    LandingDetected,
    Other(u8),
}

impl From<u8> for FlightPhase {
    fn from(value: u8) -> Self {
        match value {
            1 => FlightPhase::WaitingForLaunch,
            2 => FlightPhase::LaunchDetected,
            4 => FlightPhase::LowVelocityDetected,
            5 => FlightPhase::NoseOver,
            6 => FlightPhase::DrogueFired,
            7 => FlightPhase::MainFired,
            8 => FlightPhase::FailsafeTriggered,
            9 => FlightPhase::LandingDetected,
            _ => FlightPhase::Other(value),
        }
    }
}

pub struct Parser;

impl Parser {
    pub fn parse(data: &[u8]) -> Vec<TelemetryData> {
        let elements = data
            .chunk_by(|x, _| x == &b'>')
            .filter_map(|chunk| Parser::parse_element(chunk))
            .collect();

        elements
    }

    fn parse_element(data: &[u8]) -> Option<TelemetryData> {
        // element must have trigger and terminator and some data
        if data.len() < 3 {
            return None;
        };

        let trigger = char::from(data[0]);

        if data[data.len() - 1] != b'>' {
            return None;
        }

        // Find the terminator '>'
        if let Some(data_slice) = str::from_utf8(&data[1..data.len() - 1]).ok() {
            match trigger {
                '#' => data_slice.parse().ok().map(TelemetryData::FlightTime),
                '{' => data_slice.parse().ok().map(TelemetryData::Altitude100),
                '<' => data_slice.parse().ok().map(TelemetryData::Altitude),
                '(' => data_slice.parse().ok().map(TelemetryData::Velocity),
                '\\' => data_slice
                    .parse::<i16>()
                    .ok()
                    .map(|v| TelemetryData::Acceleration(v as f32 / 10.0)),
                '@' => data_slice
                    .parse::<u8>()
                    .ok()
                    .map(|v| TelemetryData::FlightPhase(v.into())),
                '~' => {
                    let mut channels = 0u8;
                    for (i, c) in data_slice.chars().enumerate() {
                        if c == 'A' || c == 'B' {
                            channels |= 1 << i;
                        }
                    }
                    Some(TelemetryData::Channels(channels))
                }
                '=' => Some(TelemetryData::Name(data_slice.to_string())),
                '?' => data_slice
                    .parse::<u16>()
                    .ok()
                    .map(|v| TelemetryData::BatteryVoltage(v as f32 / 10.0)),
                '%' => data_slice.parse().ok().map(TelemetryData::Apogee),
                '^' => data_slice.parse().ok().map(TelemetryData::MaxVelocity),
                '[' => data_slice.parse().ok().map(TelemetryData::MaxAcceleration),
                '!' => data_slice
                    .parse::<i16>()
                    .ok()
                    .map(|v| TelemetryData::Temperature(v as f32 / 10.0)),
                _ => Some(TelemetryData::Unknown(trigger, data_slice.to_string())),
            }
        } else {
            None
        }
    }
}

impl ProtocolTrait for Parser {
    fn parse_to_string(&self, bytes: &[u8]) -> String {
        return Parser::parse(bytes)
            .iter()
            .fold(String::from(""), |acc, x| acc + format!("{:?}", x).as_str());
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_flight_time() {
        let mut elements = Parser::parse_element(b"#0000>");
        assert_eq!(elements, Some(TelemetryData::FlightTime(0)));
    }

    #[test]
    fn test_parse_altitude_100() {
        let mut elements = Parser::parse_element(b"{040>");
        assert_eq!(elements, Some(TelemetryData::Altitude100(40)));
    }

    #[test]
    fn test_parse_altitude() {
        let mut elements = Parser::parse_element(b"<04679>");
        assert_eq!(elements, Some(TelemetryData::Altitude(4679)));
    }

    #[test]
    fn test_parse_velocity() {
        let mut elements = Parser::parse_element(b"(-0022>");
        assert_eq!(elements, Some(TelemetryData::Velocity(-22)));
    }

    #[test]
    fn test_parse_acceleration() {
        let mut elements = Parser::parse_element(b"\\-001>");
        assert_eq!(elements, Some(TelemetryData::Acceleration(-0.1)));
    }

    #[test]
    fn test_parse_flight_phase() {
        let mut elements = Parser::parse_element(b"@1>");
        assert_eq!(
            elements,
            Some(TelemetryData::FlightPhase(FlightPhase::WaitingForLaunch))
        );
    }

    #[test]
    fn test_parse_channels() {
        let mut elements = Parser::parse_element(b"~AB---->");
        // A is channel 1 (0), B is channel 2 (1). So 1 << 0 | 1 << 1 = 3
        assert_eq!(elements, Some(TelemetryData::Channels(3)));
    }

    #[test]
    fn test_parse_temperature() {
        let mut elements = Parser::parse_element(b"!211>");
        assert_eq!(elements, Some(TelemetryData::Temperature(21.1)));
    }

    #[test]
    fn test_parse_name() {
        let mut elements = Parser::parse_element(b"=KM6ZFL>");
        assert_eq!(elements, Some(TelemetryData::Name("KM6ZFL".to_string())));
    }

    #[test]
    fn test_parse_battery_voltage() {
        let mut elements = Parser::parse_element(b"?079>");
        assert_eq!(elements, Some(TelemetryData::BatteryVoltage(7.9)));
    }

    #[test]
    fn test_parse_apogee() {
        let mut elements = Parser::parse_element(b"%04679>");
        assert_eq!(elements, Some(TelemetryData::Apogee(4679)));
    }

    #[test]
    fn test_parse_max_velocity() {
        let mut elements = Parser::parse_element(b"^0660>");
        assert_eq!(elements, Some(TelemetryData::MaxVelocity(660)));
    }

    #[test]
    fn test_parse_max_acceleration() {
        let mut elements = Parser::parse_element(b"[025>");
        assert_eq!(elements, Some(TelemetryData::MaxAcceleration(25)));
    }

    #[test]
    fn test_parse_full_transmission() {
        let data = b"{040>@2>#0010>(0213>\\-001>?079>!212>=KM6ZFL>";
        let elements = Parser::parse(data);

        assert_eq!(
            elements,
            vec![
                TelemetryData::Altitude100(40),
                TelemetryData::FlightPhase(FlightPhase::LaunchDetected),
                TelemetryData::FlightTime(10),
                TelemetryData::Velocity(213),
                TelemetryData::Acceleration(-0.1),
                TelemetryData::BatteryVoltage(7.9),
                TelemetryData::Temperature(21.2),
                TelemetryData::Name("KM6ZFL".to_string()),
            ]
        );
    }

    #[test]
    fn test_parse_to_string() {
        let parser = Parser;
        let res = parser.parse_to_string(b"[025>");
        assert_eq!(res, "asd".to_string());
    }
}
