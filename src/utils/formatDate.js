import { formatDistanceToNow } from 'date-fns';

export default function formatDate(date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}
