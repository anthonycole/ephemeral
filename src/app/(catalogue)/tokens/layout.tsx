import { Theme } from "@radix-ui/themes";

export default function TokensLayout({
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
