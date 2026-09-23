import type { ViewStyle } from 'react-native';
import type { CompetitionState } from '../../api/types';
import { stateLabels, stateTone } from '../../utils/format';
import { Badge } from '../ui/Badge';

interface StateBadgeProps {
  state: CompetitionState;
  style?: ViewStyle;
}

/** Human-readable lifecycle badge driven entirely by the server's derived state. */
export function StateBadge({ state, style }: StateBadgeProps) {
  return <Badge label={stateLabels[state]} tone={stateTone[state]} style={style} />;
}
