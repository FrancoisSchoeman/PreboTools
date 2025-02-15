import Link from 'next/link';
import Image from 'next/image';

export default function Logo() {
  return (
    <Link className="flex items-center gap-2 text-2xl font-semi-bold" href="/">
      <Image
        className="dark:block hidden"
        src="/images/logo-dark-mode.webp"
        alt="Prebo Digital Tools"
        width={200}
        height={50}
      />
      <Image
        className="dark:hidden block"
        src="/images/logo-light-mode.webp"
        alt="Prebo Digital Tools"
        width={200}
        height={50}
      />
      Tools
    </Link>
  );
}
