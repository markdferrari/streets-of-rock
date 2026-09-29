export type CharacterAssetKey = 'cow' | 'crow' | 'lion' | 'plates';

const requiredClips: Record<CharacterAssetKey, string[]> = {
  cow: ['Idle', 'Move', 'Hurt', 'KnockedOut', 'Dodge',
    ...(['cow1', 'cow2', 'cow3', 'cowHeavy', 'spin'].flatMap(move => ['windup', 'active', 'recovery'].map(phase => `${move}.${phase}`)))],
  crow: ['Idle', 'Move', 'Hurt', 'KnockedOut', 'Dodge', 'crow.windup', 'crow.active', 'crow.recovery',
    ...(['crow1', 'crow2', 'crow3', 'crowHeavy', 'wingSpin'].flatMap(move => ['windup', 'active', 'recovery'].map(phase => `${move}.${phase}`)))],
  lion: ['Idle', 'Move', 'Hurt', 'KnockedOut', 'Dodge',
    ...(['lion1', 'lion2', 'lion3', 'lionHeavy', 'roar', 'lionSupport'].flatMap(move => ['windup', 'active', 'recovery'].map(phase => `${move}.${phase}`)))],
  plates: ['Idle', 'Move', 'Hurt', 'KnockedOut', 'Dodge',
    ...(['plates1', 'plates2', 'plates3', 'platesHeavy', 'headrest', 'platesSupport'].flatMap(move => ['windup', 'active', 'recovery'].map(phase => `${move}.${phase}`)))],
};

export function requiredCharacterClips(key: CharacterAssetKey): readonly string[] { return requiredClips[key]; }
