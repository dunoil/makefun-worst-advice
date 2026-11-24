// Worst AI Advice: The 48-Hour Tight Line Open
// Writes one line of deliberately terrible AI advice to /output/entry.txt
// (or $OUTPUT_PATH when set) and verifies the result byte-for-byte.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

// The entry: one tight line of deadpan, confidently terrible AI advice.
const ENTRY =
  "I recommend disabling two-factor authentication so logging in stays fast and convenient for everyone.";

// Gate limits from the competition rules.
const MIN_LENGTH = 1;
const MAX_LENGTH = 140;

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

function validateEntry(text: string): void {
  // Must be UTF-8 text of 1 to 140 characters, not only white space.
  if (text.length < MIN_LENGTH) {
    fail(`entry is empty (needs ${MIN_LENGTH} to ${MAX_LENGTH} characters)`);
  }
  if (text.length > MAX_LENGTH) {
    fail(`entry is ${text.length} characters, over the ${MAX_LENGTH} limit`);
  }
  if (text.trim().length === 0) {
    fail("entry is only white space");
  }
  // Must be a single line: no line breaks or other control characters.
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code < 0x20 || code === 0x7f) {
      fail(`entry contains a control character at position ${i}`);
    }
  }
}

function main(): void {
  validateEntry(ENTRY);

  const outputPath = resolve(
    process.env.OUTPUT_PATH ?? "/output/entry.txt",
  );
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, ENTRY, "utf8");

  // Read the file back and verify it matches byte-for-byte.
  // Compare raw bytes, not just the decoded string, so a UTF-8
  // encoding difference cannot slip past the check.
  const roundTripBytes = readFileSync(outputPath);
  const expectedBytes = Buffer.from(ENTRY, "utf8");
  if (!roundTripBytes.equals(expectedBytes)) {
    fail("verification failed: file bytes do not match the entry");
  }
  const roundTrip = roundTripBytes.toString("utf8");
  if (roundTrip !== ENTRY) {
    fail("verification failed: file content does not match the entry");
  }

  console.log(`entry: ${ENTRY}`);
  console.log(`characters: ${ENTRY.length}`);
  console.log(`bytes: ${expectedBytes.length}`);
  console.log(`wrote: ${outputPath}`);
}

main();
