import { Theme } from "@radix-ui/themes";

export default function PlaygroundLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Theme appearance="light" accentColor="blue" grayColor="slate" radius="none" scaling="100%">
      {children}
    </Theme>
  );
}
