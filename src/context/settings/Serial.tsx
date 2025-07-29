export interface LoraSettings {
    frequency: number;
    bandwidth: number;
    spreading_factor: number;
    sync_word: number;
    coding_rate: number;
}

export interface DeploymentSettings {
    apogee: boolean;
    main: boolean;
    apogee_delay: number;
    main_altitude: number;
}

export interface EntanglerSettings {
    lora: LoraSettings;
}

export interface WarpSettings {
    deployment: DeploymentSettings;
}

export type SerialSettings = { data: EntanglerSettings };
