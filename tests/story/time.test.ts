import assert from 'node:assert/strict';
import { test } from 'vitest';
import { agePhrase, formatElapsed } from '../../src/story/time.js';

test('elapsed time clamps clock rollback and sub-second ages to zero', () => {
    assert.equal(formatElapsed(2_000, 1_000), '00:00:00');
    assert.equal(formatElapsed(0, 999), '00:00:00');
    assert.equal(agePhrase(2_000, 1_000), 'less than one second');
    assert.equal(agePhrase(0, 999), 'less than one second');
});

test('second narration handles singular, named numbers, and numeric fallback', () => {
    assert.equal(agePhrase(0, 1_000), 'one second');
    assert.equal(agePhrase(0, 12_000), 'twelve seconds');
    assert.equal(agePhrase(0, 13_000), '13 seconds');
    assert.equal(agePhrase(0, 59_999), '59 seconds');
});

test('minute narration handles exact and compound boundaries', () => {
    assert.equal(agePhrase(0, 60_000), 'one minute');
    assert.equal(agePhrase(0, 61_000), 'one minute and one second');
    assert.equal(agePhrase(0, 120_000), 'two minutes');
    assert.equal(agePhrase(0, 131_000), 'two minutes and eleven seconds');
});

test('elapsed formatting supports hours without wrapping them', () => {
    assert.equal(formatElapsed(0, 3_661_000), '01:01:01');
    assert.equal(formatElapsed(0, 360_000_000), '100:00:00');
});
