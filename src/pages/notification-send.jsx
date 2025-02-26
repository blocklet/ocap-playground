import PropTypes from 'prop-types';
import Checkbox from '@mui/material/Checkbox';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';

export const defaultChannels = [
  { label: 'Wallet', value: 'app', checked: true },
  { label: 'Email', value: 'email', checked: false },
  { label: 'PushKit', value: 'push', checked: false },
  { label: 'Webhook', value: 'webhook', checked: false },
];

export default function NotificationSend({ channels = defaultChannels, onChange }) {
  const handleChange = (ev, channel) => {
    channel.checked = ev.target.checked;
    const newChannels = channels.map(c => ({ ...c, checked: c.value === channel.value ? channel.checked : c.checked }));
    onChange(newChannels);
  };

  return (
    <FormControl sx={{ m: 0, p: 0 }} component="fieldset" variant="standard">
      <FormLabel component="legend">Select Sending Channels</FormLabel>
      <FormGroup sx={{ display: 'flex', flexDirection: 'row' }}>
        {channels.map(channel => (
          <FormControlLabel
            key={channel.value}
            control={
              <Checkbox checked={channel.checked} onChange={ev => handleChange(ev, channel)} name={channel.value} />
            }
            label={channel.label}
          />
        ))}
      </FormGroup>
    </FormControl>
  );
}

NotificationSend.propTypes = {
  channels: PropTypes.array,
  onChange: PropTypes.func,
};

NotificationSend.defaultProps = {
  channels: defaultChannels,
  onChange: () => {},
};
