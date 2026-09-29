export type CharacterAssetKey = 'cow' | 'crow';

const requiredClips: Record<CharacterAssetKey, string[]> = {
  cow: ['Idle', 'Move', 'Hurt', 'KnockedOut', 'Dodge',
    ...(['cow1', 'cow2', 'cow3', 'cowHeavy', 'spin'].flatMap(move => ['windup', 'active', 'recovery'].map(phase => `${move}.${phase}`)))],
  crow: ['Idle', 'Move', 'Hurt', 'KnockedOut', 'Dodge', 'crow.windup', 'crow.active', 'crow.recovery',
    ...(['crow1', 'crow2', 'crow3', 'crowHeavy', 'wingSpin'].flatMap(move => ['windup', 'active', 'recovery'].map(phase => `${move}.${phase}`)))],
};

export function requiredCharacterClips(key: CharacterAssetKey): readonly string[] { return requiredClips[key]; }
