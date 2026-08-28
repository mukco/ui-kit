/* Estate UI kit. Import `ui/ui.css` once at boot, then use components freely.
   Sports components additionally need `configureSports({...})` before first use. */
export { cn } from "./cn";
export { AwardCard } from "./primitives/AwardCard";
export { Assistant } from "./primitives/Assistant";
export { AutoLinkedText } from "./primitives/AutoLinkedText";
export { NAME_RE, normalizeName, matchKey, extractCandidates, resolveKnownPlayers } from "./sports/playerNames";
export { Avatar } from "./primitives/Avatar";
export { BasicTable } from "./primitives/BasicTable";
export { Button } from "./primitives/Button";
export { Card } from "./primitives/Card";
export { CardStrip } from "./primitives/CardStrip";
export { DataTable, HeatPill } from "./primitives/DataTable";
export { DateNav } from "./primitives/DateNav";
export { Drawer } from "./primitives/Drawer";
export { EmptyState } from "./primitives/EmptyState";
export { ErrorState } from "./primitives/ErrorState";
export { ConfirmDialog } from "./primitives/ConfirmDialog";
export { useFocusTrap } from "./primitives/useFocusTrap";
export { useRovingSelect } from "./primitives/useRovingSelect";
export { IconButton } from "./primitives/IconButton";
export { NavSearch } from "./primitives/NavSearch";
export { ThemeSwitch } from "./primitives/ThemeSwitch";
export { IconSun, IconMoon, IconSignOut, IconSettings, IconSearch, IconRefresh, IconClose, IconBell, } from "./primitives/Icon";
export { ExpandableCard } from "./primitives/ExpandableCard";
export { FactGrid } from "./primitives/FactGrid";
export { HelpTip } from "./primitives/HelpTip";
export { InsightsCard } from "./primitives/InsightsCard";
export { Loading } from "./primitives/Loading";
export { ListRow, ListRows } from "./primitives/ListRow";
export { LogStream, logLevelOf, parseLogBody } from "./primitives/LogStream";
export { MatchupCard } from "./primitives/MatchupCard";
export { NavBar } from "./primitives/NavBar";
export { PageHeader } from "./primitives/PageHeader";
export { SearchSelect } from "./primitives/SearchSelect";
export { SectionLabel } from "./primitives/SectionLabel";
export { SegmentedControl } from "./primitives/SegmentedControl";
export { NotificationBell } from "./notifications/NotificationBell";
export { Chip, SelectField, SettingRow, TextField, Toggle } from "./primitives/Settings";
export { SettingsGroup } from "./primitives/SettingsGroup";
export { UpdateToast } from "./primitives/UpdateToast";
// Exported on its own for apps that cannot take ui.css yet. That file is not
// scoped — it sets :root, html, body and focus styles — so an app with its own
// design system cannot import it just to get one toast. Those apps keep their
// own markup and call this before reloading, which is where the bug was.
export { readyForNewBuild } from "./primitives/updateReady";
export { SortedList } from "./primitives/SortedList";
export { StatusDot, StatusGrid, SEVERITY_ORDER } from "./primitives/Status";
export { TriageList } from "./primitives/TriageList";
export { TimeRangePicker, DEFAULT_TIME_RANGES } from "./primitives/TimeRangePicker";
export { InlineStatRow, PercentileBar, StatCard, rampColor } from "./primitives/StatCard";
export { ThemeToggle, useTheme } from "./primitives/ThemeToggle";
export { Tabs } from "./primitives/Tabs";
export { ordinal } from "./lib/ordinal";
// Charts
export { DynamicChart, chartPalette } from "./charts/DynamicChart";
export { PercentileGauge } from "./charts/PercentileGauge";
export { RollingAverageChart } from "./charts/RollingAverageChart";
export { SparklineChart } from "./charts/SparklineChart";
// SQL workbench
export { SandboxCell } from "./workbench/SandboxCell";
export { SandboxChart } from "./workbench/SandboxChart";
export { SandboxPivot } from "./workbench/SandboxPivot";
export { SandboxProvider, useSandbox } from "./workbench/SandboxContext";
// Model/experiment suite (shapes; the "ml" glossary is one content module)
export { ClassBreakdownChart } from "./models/ClassBreakdownChart";
export { LayerBuilder } from "./models/LayerBuilder";
export { GlossaryTip } from "./primitives/GlossaryTip";
export { ML_GLOSSARY } from "./models/glossary";
export { ModelResults } from "./models/ModelResults";
export { NNExplainer } from "./models/NNExplainer";
export { PredActualChart } from "./models/PredActualChart";
export { RunComparison } from "./models/RunComparison";
export { RunHistory } from "./models/RunHistory";
// Sports identity
export { configureSports, sportsIdentity } from "./sports/config";
export { PlayerLink } from "./sports/PlayerLink";
export { TeamIcon } from "./sports/TeamIcon";
export { TeamLink } from "./sports/TeamLink";
