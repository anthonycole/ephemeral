import { Container, Heading, Text } from "@radix-ui/themes";

export default function NotFound() {
  return (
    <main className="min-h-screen py-16">
      <Container size="3" px="4">
        <Heading size="7">Page not found</Heading>
        <Text color="gray" mt="2">
          The page you are looking for does not exist.
        </Text>
      </Container>
    </main>
  );
}
