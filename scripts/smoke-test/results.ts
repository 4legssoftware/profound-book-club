export type Results = {
  pass(message: string): void;
  fail(message: string): void;
  report(): boolean;
};

export function createResults(): Results {
  let passed = 0;
  const errors: string[] = [];

  return {
    pass(message) {
      console.log(`✅ ${message}`);
      passed += 1;
    },
    fail(message) {
      console.error(`❌ ${message}`);
      errors.push(message);
    },
    report() {
      console.log(`\n📊 Results: ${passed} passed, ${errors.length} failed\n`);

      if (errors.length > 0) {
        console.error('Failed checks:');
        errors.forEach((error) => console.error(`  - ${error}`));
        return false;
      }

      console.log('✅ All smoke tests passed!');
      return true;
    },
  };
}
