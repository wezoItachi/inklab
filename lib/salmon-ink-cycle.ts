import document from '../database/salmon-ink-cycle-evidence.v11.3.0.json' with { type: 'json' };

export type SalmonEvidenceApplicability =
  | 'verified'
  | 'inherited'
  | 'base-inherited'
  | 'pending';

export const salmonInkCycleEvidence = document;

export const salmonRecoveryModelGate = {
  ready: document.modelGate.sustainedOutput === 'ready',
  blockers: document.modelGate.reasons,
} as const;

export const salmonSplatBombCycle = {
  inkConsumptionPercent: document.evidence.salmonSplatBomb.fields.find(
    ({ key }) => key === 'inkConsumption',
  )!.value,
  inkRecoveryLockFrames: document.evidence.salmonSplatBomb.fields.find(
    ({ key }) => key === 'inkRecoveryLock',
  )!.value,
} as const;
