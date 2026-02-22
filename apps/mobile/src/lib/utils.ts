import { CertificationType } from '@halalspot/shared-types';

export function getCertificationLabel(type: CertificationType): string {
    switch (type) {
        case 'halal_certified':
            return 'Halal Certified';
        case 'muslim_owned':
            return 'Muslim Owned';
        case 'halal_options':
            return 'Halal Options';
        default:
            return 'Unknown';
    }
}

export function getCertificationColor(type: CertificationType): string {
    switch (type) {
        case 'halal_certified':
            return '#059669';
        case 'muslim_owned':
            return '#2563eb';
        case 'halal_options':
            return '#7c3aed';
        default:
            return '#9ca3af';
    }
}
