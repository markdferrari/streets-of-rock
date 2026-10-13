import {expect,it} from 'vitest';
import {diagnosticsPayload} from '../../web/diagnostics';
it('decodes the Godot bridge JSON into a local structured report',()=>{
  const report={schemaVersion:1,frameIntervalsMs:[16,17],rollingFps:60};
  expect(JSON.parse(diagnosticsPayload(JSON.stringify(report)))).toEqual(report);
  expect(JSON.parse(diagnosticsPayload(report))).toEqual(report);
});
