import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ARENA_TICKET_MS, consume, regenerate } from '../tickets';

const T0 = 1_700_000_000_000;

describe('jetons de batay', () => {
  it('un jeton revient une fois le délai passé', () => {
    const s = regenerate({ tickets: 0, nextAt: T0 }, 3, T0 + 10);
    assert.equal(s.tickets, 1);
    assert.equal(s.nextAt, T0 + 10 + ARENA_TICKET_MS);
  });

  it('rien ne bouge avant l’échéance', () => {
    const avant = { tickets: 1, nextAt: T0 + ARENA_TICKET_MS };
    assert.deepEqual(regenerate(avant, 3, T0), avant);
  });

  it('une app fermée longtemps rend tous les jetons dus', () => {
    // le piège : ne rendre qu'un seul jeton après une nuit hors ligne
    const s = regenerate({ tickets: 0, nextAt: T0 }, 3, T0 + ARENA_TICKET_MS * 12);
    assert.equal(s.tickets, 3, 'les jetons accumulés ne sont pas rendus');
  });

  it('le plafond est respecté et arrête la recharge', () => {
    const s = regenerate({ tickets: 0, nextAt: T0 }, 3, T0 + ARENA_TICKET_MS * 99);
    assert.equal(s.tickets, 3);
    assert.equal(s.nextAt, 0, 'la recharge continue alors que tout est plein');
  });

  it('au maximum, rien ne se régénère', () => {
    const s = regenerate({ tickets: 5, nextAt: 0 }, 5, T0);
    assert.equal(s.tickets, 5);
    assert.equal(s.nextAt, 0);
  });

  it('un plafond relevé par un talent se remplit aussi', () => {
    const s = regenerate({ tickets: 3, nextAt: T0 }, 5, T0 + ARENA_TICKET_MS * 2);
    assert.equal(s.tickets, 5);
  });

  it('consommer depuis le plein démarre la recharge', () => {
    const s = consume({ tickets: 3, nextAt: 0 }, 3, T0);
    assert.equal(s.tickets, 2);
    assert.equal(s.nextAt, T0 + ARENA_TICKET_MS, 'la recharge ne démarre pas');
  });

  it('consommer ne repousse pas une recharge déjà lancée', () => {
    // sinon enchaîner les combats repousserait indéfiniment le prochain jeton
    const en_cours = T0 + 30_000;
    const s = consume({ tickets: 2, nextAt: en_cours }, 3, T0);
    assert.equal(s.nextAt, en_cours);
  });

  it('on ne descend jamais sous zéro', () => {
    assert.equal(consume({ tickets: 0, nextAt: T0 }, 3, T0).tickets, 0);
  });
});
