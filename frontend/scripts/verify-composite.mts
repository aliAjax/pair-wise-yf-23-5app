import { strict as assert } from "assert";
import { CompositeEngine } from "../src/lighting/CompositeEngine";
import { mockData } from "../src/mocks/seedData";
import type { CueScene } from "../src/types/CueScene";
import type { TimelineTrack } from "../src/types/TimelineTrack";

const engine = new CompositeEngine();
engine.setFixtures(mockData.fixture as any);
engine.setScenes(mockData.cueScene as CueScene[]);
engine.setTracks(mockData.timelineTrack as TimelineTrack[]);

const colorOf = (results: any[], id: number) => results.find((r) => r.fixtureId === id);

// t=1000：仅红色铺底（淡入已完成）
engine.seek(1000);
let res = engine.recomputeAll();
assert.equal(colorOf(res, 1).winningSceneId, 1, "t1 灯1应为红场");
assert.equal(colorOf(res, 5).active, false, "停用灯具不参与");
assert.equal(colorOf(res, 5).color.dimmer, 0);

// t=3500：蓝(layer2,pri5) 与 绿(layer2,pri8) 同刻开始 -> 灯1由绿色后覆盖；灯3仅蓝色
engine.seek(3500);
res = engine.recomputeAll();
const f1 = colorOf(res, 1);
assert.equal(f1.winningSceneId, 3, "同刻高优先级(绿8)应后覆盖蓝5");
assert.deepEqual(
  f1.contributors.map((c: any) => c.sceneId),
  [1, 2, 3],
  "覆盖链路应按 红->蓝->绿 排列"
);
const f3 = colorOf(res, 3);
assert.equal(f3.winningSceneId, 2, "灯3仅蓝色场景控制");

// t=7000：锁定白闪(layer0)必须压住普通 layer1/layer2
engine.seek(7000);
res = engine.recomputeAll();
const f1b = colorOf(res, 1);
assert.equal(f1b.winningSceneId, 4, "锁定轨道即使layer0也压住普通轨道");
assert.equal(f1b.color.dimmer, 255);
assert.equal(f1b.contributors[f1b.contributors.length - 1].locked, true);
// 停用场景(id5)即便layer3也不得出现
assert.ok(!f1b.contributors.some((c: any) => c.sceneId === 5), "停用场景不参与");

// t=7000 灯4：红场不控制灯4? 实际场景1控制灯4，场景4也控制 -> 白闪胜
assert.equal(colorOf(res, 4).winningSceneId, 4);

// 淡入：t=3100（绿场景3000开始，fade400，过100ms -> fade 0.25）
engine.seek(3100);
res = engine.recomputeAll();
const greenContributor = colorOf(res, 1).contributors.find((c: any) => c.sceneId === 3);
assert.ok(Math.abs(greenContributor.fade - 0.25) < 1e-9, "fade应=0.25");
assert.equal(greenContributor.color.green, Math.round(220 * 0.25));

// 增量重算范围：改场景3只重算它控制的灯 [1,2]
engine.seek(5000);
engine.recomputeAll();
const affectedScenes = engine.affectedByScene(3);
assert.deepEqual(affectedScenes.sort(), [1, 2], "改场景3只影响灯1,2");
// 改轨道2（绑定场景2控制1,2,3）
const affectedTrack = engine.affectedByTracks([2]);
assert.deepEqual(affectedTrack.sort(), [1, 2, 3], "改轨道2影响灯1,2,3");
// 改灯具仅自身
assert.deepEqual(engine.affectedByFixtures([4]), [4]);

// 纯增量：仅把绿轨道(3)移出当前时刻(t5000)，不应全量重算，且灯1/2 回退到蓝
const tracksOnlyMoved = (mockData.timelineTrack as TimelineTrack[]).map((t) =>
  t.id === 3 ? { ...t, start_ms: 9000, duration_ms: 1000 } : t
);
engine.setTracks(tracksOnlyMoved);
const movedAffected = engine.affectedByTracks([3]);
assert.deepEqual(movedAffected.sort(), [1, 2], "移绿轨道只需重算它原控制的灯1,2");
res = engine.recompute(movedAffected);
assert.equal(colorOf(res, 1).winningSceneId, 2, "灯1回退蓝");
assert.equal(colorOf(res, 2).winningSceneId, 2, "灯2回退蓝");
// 恢复轨道，继续后续用例
engine.setTracks(mockData.timelineTrack as TimelineTrack[]);

// 改场景优先级：把蓝(pri5)提升到20 -> 同刻蓝后覆盖绿
const scenes = mockData.cueScene.map((s) => ({ ...s, fixture_states: structuredClone(s.fixture_states) })) as CueScene[];
const blueScene = scenes.find((s) => s.id === 2)!;
blueScene.priority = 20;
engine.setScenes(scenes);
engine.seek(5000);
res = engine.recompute(engine.affectedByScene(2));
assert.equal(colorOf(res, 1).winningSceneId, 2, "蓝优先级20后应覆盖绿");

// 解锁白闪轨道 -> t7000 不再被白闪压制，灯3回到蓝色
const tracks = (mockData.timelineTrack as TimelineTrack[]).map((t) => (t.id === 4 ? { ...t, locked: false } : t));
engine.setTracks(tracks);
engine.seek(7000);
res = engine.recompute(engine.affectedByTracks([4]));
assert.equal(colorOf(res, 3).winningSceneId, 2, "白闪解锁后，普通轨道按图层，灯3回到蓝(layer2)");

// 停用场景2 -> t3500 灯3 回退到红场（场景1全程控制），灯1 仍被绿控制
const scenes2 = (mockData.cueScene as CueScene[]).map((s) =>
  s.id === 2 ? { ...s, fixture_states: structuredClone(s.fixture_states), scene_status: "DISABLED" } : { ...s, fixture_states: structuredClone(s.fixture_states) }
);
engine.setScenes(scenes2);
engine.seek(3500);
res = engine.recompute(engine.affectedByScene(2));
assert.equal(colorOf(res, 3).winningSceneId, 1, "停用蓝场景后灯3回退红场");
assert.ok(!colorOf(res, 3).contributors.some((c: any) => c.sceneId === 2), "链路中不应再有蓝场景");
assert.equal(colorOf(res, 1).winningSceneId, 3, "灯1仍由绿色控制");

// 增量回归：把绿轨道(3)从 3000-8000 移到 9000 之后，t3500 灯1 应回退到蓝(pri5)
// 场景2 在上一步被停用，需要先恢复一份启用数据
const scenesEnabled = (mockData.cueScene as CueScene[]).map((s) => ({ ...s, fixture_states: structuredClone(s.fixture_states) }));
engine.setScenes(scenesEnabled);
const tracksMoved = (mockData.timelineTrack as TimelineTrack[]).map((t) =>
  t.id === 3 ? { ...t, start_ms: 9000, duration_ms: 1000 } : t
);
engine.setTracks(tracksMoved);
engine.seek(3500);
res = engine.recomputeAll(); // 恢复场景 + 移轨道属于两次编辑，取并集即全量
assert.equal(colorOf(res, 1).winningSceneId, 2, "绿轨道移走后，灯1回退到蓝场景");
assert.equal(colorOf(res, 2).winningSceneId, 2, "灯2同样回退蓝场景");
assert.equal(colorOf(res, 3).winningSceneId, 2, "灯3为蓝场景");

console.log("ALL COMPOSITE TESTS PASSED");
