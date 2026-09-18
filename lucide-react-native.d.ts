// Type declarations for lucide-react-native
declare module 'lucide-react-native' {
    import { ComponentType } from 'react';
    import { ViewStyle } from 'react-native';

    export interface LucideProps {
        size?: number;
        color?: string;
        fill?: string;
        strokeWidth?: number;
        absoluteStrokeWidth?: boolean;
        style?: ViewStyle;
    }

    export type LucideIcon = ComponentType<LucideProps>;

    // Export all icons with proper typing
    export const Home: LucideIcon;
    export const MessageSquare: LucideIcon;
    export const Calendar: LucideIcon;
    export const User: LucideIcon;
    export const Bell: LucideIcon;
    export const BookOpen: LucideIcon;
    export const Eye: LucideIcon;
    export const EyeOff: LucideIcon;
    export const ArrowLeft: LucideIcon;
    export const Mail: LucideIcon;
    export const Lock: LucideIcon;
    export const GraduationCap: LucideIcon;
    export const Users: LucideIcon;
    export const Plus: LucideIcon;
    export const X: LucideIcon;
    export const Upload: LucideIcon;
    export const FileText: LucideIcon;
    export const Check: LucideIcon;
    export const CheckCircle2: LucideIcon;
    export const Clock: LucideIcon;
    export const Minus: LucideIcon;
    export const Send: LucideIcon;
    export const SlidersHorizontal: LucideIcon;
    export const DollarSign: LucideIcon;
    export const MapPin: LucideIcon;
    export const ChevronRight: LucideIcon;
    export const ChevronDown: LucideIcon;
    export const ChevronLeft: LucideIcon;
    export const UserCircle: LucideIcon;
    export const Edit: LucideIcon;
    export const Settings: LucideIcon;
    export const LogOut: LucideIcon;
    export const CreditCard: LucideIcon;
    export const Trash2: LucideIcon;
    export const Camera: LucideIcon;
    export const UserX: LucideIcon;
    export const Video: LucideIcon;
    export const MessageCircle: LucideIcon;
    export const Search: LucideIcon;
    export const Star: LucideIcon;
    export const Heart: LucideIcon;
    export const CircleHelp: LucideIcon;
    export const Pencil: LucideIcon;
    export const ShieldOff: LucideIcon;
    export const UserMinus: LucideIcon;
}
