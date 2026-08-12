import { HugeiconsIcon } from "@hugeicons/react";
import PropTypes from "prop-types";

/**
 * react-icons–compatible wrapper around @hugeicons/react so existing
 * `<Icon size={20} strokeWidth={2} />` call-sites keep working unchanged.
 */
const HugeIcon = ({ icon, size = 24, ...rest }) => (
  <HugeiconsIcon icon={icon} size={size} {...rest} />
);

HugeIcon.propTypes = {
  icon: PropTypes.any.isRequired,
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default HugeIcon;