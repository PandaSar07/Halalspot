import React, { useState, useEffect, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Dimensions,
    Platform,
    TextInput,
    PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/ThemeContext';
import { Shadow } from '../lib/theme';

const { width, height } = Dimensions.get('window');

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FilterState {
    cuisines: string[];
    location: 'near_me' | 'custom';
    customLocation: string;
    radiusMiles: number;
    priceRange: string[];
    minRating: number | null;
    hours: string[];
    sortBy: string;
}

export const DEFAULT_FILTERS: FilterState = {
    cuisines: [],
    location: 'near_me',
    customLocation: '',
    radiusMiles: 10,
    priceRange: [],
    minRating: null,
    hours: [],
    sortBy: 'Relevance',
};

/**
 * Returns the number of filter *groups* that have an active selection.
 * Used for the badge count on the filter button.
 */
export function countActiveFilters(f: FilterState): number {
    let count = 0;
    if (f.cuisines.length > 0) count++;
    if (f.location === 'custom' && f.customLocation.trim()) count++;
    if (f.radiusMiles !== DEFAULT_FILTERS.radiusMiles) count++;
    if (f.priceRange.length > 0) count++;
    if (f.minRating !== null) count++;
    if (f.hours.length > 0) count++;
    if (f.sortBy !== DEFAULT_FILTERS.sortBy) count++;
    return count;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CUISINES = [
    'American', 'Italian', 'Mexican', 'Chinese', 'Japanese',
    'Indian', 'Mediterranean', 'Thai', 'French', 'Korean',
    'Vegan/Vegetarian', 'Middle Eastern', 'Pakistani', 'Seafood',
    'BBQ', 'Caribbean', 'Lebanese', 'Bangladeshi',
];

const PRICES = ['$', '$$', '$$$'];
const RATINGS = [{ label: '3+ ★', value: 3 }, { label: '4+ ★', value: 4 }, { label: '4.5+ ★', value: 4.5 }];
const HOURS_OPTIONS = [
    { label: 'Open Now', value: 'open_now' },
    { label: 'Open Late', value: 'open_late' },
    { label: '24 Hours', value: '24_hours' },
];
const SORT_OPTIONS = ['Relevance', 'Distance', 'Rating', 'Most Reviewed', 'Newest'];
const RADIUS_STEPS = [0.5, 1, 2, 5, 10, 15, 25];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title, theme }: { title: string; theme: any }) {
    return (
        <View style={styles.sectionHeader}>
            <View style={[styles.sectionAccent, { backgroundColor: theme.primary }]} />
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{title}</Text>
        </View>
    );
}

function Chip({
    label, selected, onPress, theme, wide,
}: {
    label: string; selected: boolean; onPress: () => void; theme: any; wide?: boolean;
}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            style={[
                styles.chip,
                wide && styles.chipWide,
                selected
                    ? { backgroundColor: theme.primary, borderColor: theme.primary }
                    : { backgroundColor: theme.bgElevated, borderColor: theme.border },
            ]}
        >
            <Text style={[styles.chipText, { color: selected ? '#fff' : theme.textSecondary }]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

/** Simple step-based slider rendered as a track + thumb using touches */
function StepSlider({
    steps, value, onChange, theme,
}: {
    steps: number[]; value: number; onChange: (v: number) => void; theme: any;
}) {
    const [trackWidth, setTrackWidth] = useState(width - 64);
    const idx = steps.indexOf(value) === -1 ? 0 : steps.indexOf(value);
    const pct = idx / (steps.length - 1);
    const thumbLeft = pct * trackWidth - 11; // center the 22px thumb

    const panRef = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (e) => {
                const x = e.nativeEvent.locationX;
                const ratio = Math.max(0, Math.min(1, x / trackWidth));
                const newIdx = Math.round(ratio * (steps.length - 1));
                onChange(steps[newIdx]);
            },
            onPanResponderMove: (e) => {
                const x = e.nativeEvent.locationX;
                const ratio = Math.max(0, Math.min(1, x / trackWidth));
                const newIdx = Math.round(ratio * (steps.length - 1));
                onChange(steps[newIdx]);
            },
        })
    );

    return (
        <View style={{ paddingHorizontal: 8 }}>
            <View
                style={[styles.sliderTrack, { backgroundColor: theme.border }]}
                onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
                {...panRef.current.panHandlers}
            >
                <View style={[styles.sliderFill, { width: pct * trackWidth, backgroundColor: theme.primary }]} />
                <View style={[styles.sliderThumb, { left: thumbLeft, backgroundColor: theme.primary, borderColor: theme.bgCard }]} />
            </View>
            <View style={styles.sliderLabels}>
                {steps.map((s) => (
                    <Text key={s} style={[styles.sliderLabel, { color: theme.textMuted }]}>{s < 1 ? s : `${s}`}</Text>
                ))}
            </View>
        </View>
    );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

interface FilterPanelProps {
    visible: boolean;
    onClose: () => void;
    filters: FilterState;
    onApply: (f: FilterState) => void;
}

export default function FilterPanel({ visible, onClose, filters, onApply }: FilterPanelProps) {
    const { theme } = useTheme();
    const [local, setLocal] = useState<FilterState>(filters);

    // Sync external state into local when panel opens
    useEffect(() => {
        if (visible) setLocal(filters);
    }, [visible]);

    function toggleCuisine(c: string) {
        setLocal(prev => ({
            ...prev,
            cuisines: prev.cuisines.includes(c)
                ? prev.cuisines.filter(x => x !== c)
                : [...prev.cuisines, c],
        }));
    }

    function togglePrice(p: string) {
        setLocal(prev => ({
            ...prev,
            priceRange: prev.priceRange.includes(p)
                ? prev.priceRange.filter(x => x !== p)
                : [...prev.priceRange, p],
        }));
    }

    function toggleHour(h: string) {
        setLocal(prev => ({
            ...prev,
            hours: prev.hours.includes(h)
                ? prev.hours.filter(x => x !== h)
                : [...prev.hours, h],
        }));
    }

    function handleClear() {
        setLocal(DEFAULT_FILTERS);
    }

    function handleApply() {
        onApply(local);
        onClose();
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
            statusBarTranslucent
        >
            {/* Root container — required for absolute children to have a coordinate space in transparent Modals */}
            <View style={styles.modalRoot}>
            {/* Backdrop */}
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

            {/* Sheet */}
            <View style={[styles.sheet, { backgroundColor: theme.bgCard }]}>
                {/* Handle */}
                <View style={[styles.handle, { backgroundColor: theme.border }]} />

                {/* Header */}
                <View style={[styles.header, { borderBottomColor: theme.border }]}>
                    <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Filters</Text>
                    <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                        <Ionicons name="close" size={22} color={theme.textSecondary} />
                    </TouchableOpacity>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ── Cuisine Type ─────────────────────────────────────── */}
                    <SectionHeader title="Cuisine Type" theme={theme} />
                    <View style={styles.chipGrid}>
                        {CUISINES.map(c => (
                            <Chip
                                key={c}
                                label={c}
                                selected={local.cuisines.includes(c)}
                                onPress={() => toggleCuisine(c)}
                                theme={theme}
                            />
                        ))}
                    </View>

                    {/* ── Location Preference ──────────────────────────────── */}
                    <SectionHeader title="Location" theme={theme} />
                    <View style={styles.row}>
                        <Chip
                            label="📍 Near Me"
                            selected={local.location === 'near_me'}
                            onPress={() => setLocal(p => ({ ...p, location: 'near_me' }))}
                            theme={theme}
                            wide
                        />
                        <Chip
                            label="🔍 Custom"
                            selected={local.location === 'custom'}
                            onPress={() => setLocal(p => ({ ...p, location: 'custom' }))}
                            theme={theme}
                            wide
                        />
                    </View>
                    {local.location === 'custom' && (
                        <TextInput
                            style={[styles.textInput, {
                                backgroundColor: theme.bgElevated,
                                borderColor: theme.border,
                                color: theme.textPrimary,
                            }]}
                            placeholder="Enter zip code or city name…"
                            placeholderTextColor={theme.textMuted}
                            value={local.customLocation}
                            onChangeText={t => setLocal(p => ({ ...p, customLocation: t }))}
                        />
                    )}

                    {/* Radius */}
                    <View style={styles.radiusRow}>
                        <Text style={[styles.radiusLabel, { color: theme.textSecondary }]}>Distance radius</Text>
                        <Text style={[styles.radiusValue, { color: theme.primary }]}>{local.radiusMiles} mi</Text>
                    </View>
                    <StepSlider
                        steps={RADIUS_STEPS}
                        value={local.radiusMiles}
                        onChange={v => setLocal(p => ({ ...p, radiusMiles: v }))}
                        theme={theme}
                    />

                    {/* ── Price Range ──────────────────────────────────────── */}
                    <SectionHeader title="Price Range" theme={theme} />
                    <View style={styles.row}>
                        {PRICES.map(p => (
                            <Chip
                                key={p}
                                label={p}
                                selected={local.priceRange.includes(p)}
                                onPress={() => togglePrice(p)}
                                theme={theme}
                                wide
                            />
                        ))}
                    </View>

                    {/* ── Rating ───────────────────────────────────────────── */}
                    <SectionHeader title="Minimum Rating" theme={theme} />
                    <View style={styles.row}>
                        {RATINGS.map(r => (
                            <Chip
                                key={r.label}
                                label={r.label}
                                selected={local.minRating === r.value}
                                onPress={() => setLocal(p => ({ ...p, minRating: p.minRating === r.value ? null : r.value }))}
                                theme={theme}
                                wide
                            />
                        ))}
                    </View>

                    {/* ── Hours ────────────────────────────────────────────── */}
                    <SectionHeader title="Hours" theme={theme} />
                    <View style={styles.row}>
                        {HOURS_OPTIONS.map(h => (
                            <Chip
                                key={h.value}
                                label={h.label}
                                selected={local.hours.includes(h.value)}
                                onPress={() => toggleHour(h.value)}
                                theme={theme}
                                wide
                            />
                        ))}
                    </View>

                    {/* ── Sort By ──────────────────────────────────────────── */}
                    <SectionHeader title="Sort By" theme={theme} />
                    <View style={styles.chipGrid}>
                        {SORT_OPTIONS.map(s => (
                            <Chip
                                key={s}
                                label={s}
                                selected={local.sortBy === s}
                                onPress={() => setLocal(p => ({ ...p, sortBy: s }))}
                                theme={theme}
                            />
                        ))}
                    </View>

                    <View style={{ height: 16 }} />
                </ScrollView>

                {/* Footer */}
                <View style={[styles.footer, { borderTopColor: theme.border, backgroundColor: theme.bgCard }]}>
                    <TouchableOpacity
                        onPress={handleClear}
                        style={[styles.btnClear, { borderColor: theme.border }]}
                        activeOpacity={0.75}
                    >
                        <Text style={[styles.btnClearText, { color: theme.textSecondary }]}>Clear All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleApply}
                        style={[styles.btnApply, { backgroundColor: theme.primary }]}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.btnApplyText}>Apply Filters</Text>
                    </TouchableOpacity>
                </View>
            </View>
            </View>
        </Modal>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const SHEET_MAX_HEIGHT = height * 0.88;

const styles = StyleSheet.create({
    modalRoot: {
        flex: 1,
    },
    backdrop: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
    },
    sheet: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        maxHeight: SHEET_MAX_HEIGHT,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        ...Shadow.card,
    },
    handle: {
        width: 40, height: 4, borderRadius: 2,
        alignSelf: 'center',
        marginTop: 10, marginBottom: 4,
    },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 14,
        borderBottomWidth: 1,
    },
    headerTitle: { fontSize: 18, fontFamily: 'Outfit-SemiBold', fontWeight: '700' },
    scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, marginBottom: 12 },
    sectionAccent: { width: 3, height: 18, borderRadius: 2 },
    sectionTitle: { fontSize: 15, fontFamily: 'Outfit-SemiBold', fontWeight: '700' },
    chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    row: { flexDirection: 'row', gap: 8 },
    chip: {
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 100, borderWidth: 1.5,
    },
    chipWide: { flex: 1, alignItems: 'center' },
    chipText: { fontSize: 13, fontFamily: 'Outfit-SemiBold' },
    textInput: {
        marginTop: 10, borderWidth: 1, borderRadius: 14,
        paddingHorizontal: 14, paddingVertical: 10,
        fontSize: 14, fontFamily: 'Outfit',
    },
    radiusRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 12, marginBottom: 8,
    },
    radiusLabel: { fontSize: 14, fontFamily: 'Outfit' },
    radiusValue: { fontSize: 14, fontFamily: 'Outfit-SemiBold' },
    sliderTrack: {
        height: 6, borderRadius: 3,
        position: 'relative', overflow: 'visible',
        justifyContent: 'center',
    },
    sliderFill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 3 },
    sliderThumb: {
        position: 'absolute', width: 22, height: 22, borderRadius: 11,
        borderWidth: 3, marginLeft: -11,
        top: -8,
        ...Shadow.card,
    },
    sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
    sliderLabel: { fontSize: 10, fontFamily: 'Outfit' },
    footer: {
        flexDirection: 'row', gap: 10,
        paddingHorizontal: 20, paddingTop: 14, paddingBottom: Platform.OS === 'ios' ? 36 : 20,
        borderTopWidth: 1,
    },
    btnClear: {
        flex: 1, paddingVertical: 14, borderRadius: 100, borderWidth: 1.5,
        alignItems: 'center', justifyContent: 'center',
    },
    btnClearText: { fontSize: 15, fontFamily: 'Outfit-SemiBold' },
    btnApply: {
        flex: 2, paddingVertical: 14, borderRadius: 100,
        alignItems: 'center', justifyContent: 'center',
        ...Shadow.glow,
    },
    btnApplyText: { color: '#fff', fontSize: 15, fontFamily: 'Outfit-SemiBold', fontWeight: '700' },
});
