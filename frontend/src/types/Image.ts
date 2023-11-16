
export type Image = {
    name: string;
    exif: {
        aperture: number;
        exposure: number;
        datetime: string;
        focal_length: number;
        focal_length_35: number;
        iso: number;
        lens: string;
        manufacturer: string;
        model: string;
        software: string;
    };
}

export default Image;