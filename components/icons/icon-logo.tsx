
import Image from "next/image";

export default function IconLogo({
  backgroundColor = 'transparent',
  foregroundColor = 'var(--accents-1)',
  ...props
}) {
  return (
    <Image src="https://www.datocms-assets.com/104417/1690346330-c.png" alt="Logo" width="64" height="64" {...props} />
  );
}
