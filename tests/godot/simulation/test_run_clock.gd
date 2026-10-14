extends GutTest
const State = preload("res://game/simulation/run_state.gd")
const Clocks = preload("res://game/app/clocks.gd")
const Catalogue = preload("res://game/content/catalogue.gd")
func test_constructors_all_duos_are_independent_and_role_correct() -> void:
 var content := Catalogue.new()
 assert_true(content.load_catalogue())
 for fighter in content.roster:
  for partner in content.roster:
   if fighter == partner: continue
   var run := State.create_run(7, {"fighterId": fighter, "partnerId": partner}, content)
   assert_eq(run.get("tick"), 0)
   assert_eq(run.get("nextEntityId"), 3)
   assert_eq(run.get("actors", []).size(), 2)
   if run.get("actors", []).size() != 2: continue
   assert_eq(run.actors[0].hp, content.definitions[fighter].player.maxHp)
   assert_eq(run.actors[1].hp, content.definitions[partner].partner.maxHp)
   assert_eq(run.actors[0].id, 1)
   assert_eq(run.actors[1].id, 2)
   run.actors[0].hp = 0
   assert_gt(State.create_run(8, run.duo, content).actors[0].hp, 0)
 assert_eq(State.create_run(1, {"fighterId": "cow", "partnerId": "cow"}, content), {})
func test_accumulator_first_frame_cap_pause_and_exact_boundary() -> void:
 var clock := Clocks.new()
 assert_eq(clock.frame(0, true), 0)
 assert_eq(clock.frame(1000.0 / 60.0, true), 1)
 assert_eq(clock.frame(10000, true), 5)
 assert_gt(clock.discarded_ms, 9000.0)
 assert_eq(clock.frame(12000, false), 0)
 assert_eq(clock.frame(20000, true), 0)
 assert_eq(clock.frame(20000 + 1000.0 / 60.0, true), 1)
func test_wall_clock_no_five_minute_terminal_and_pause() -> void:
 var clock := Clocks.ActiveClock.new()
 clock.start(10)
 assert_eq(clock.elapsed(360010), 360000.0)
 clock.pause(360010)
 assert_eq(clock.elapsed(999999), 360000.0)
 clock.start(1000000)
 assert_eq(clock.elapsed(1000050), 360050.0)
func test_countdown_stalls_do_not_skip_and_partial_time_survives_pause() -> void:
 var countdown := Clocks.Countdown.new(0)
 assert_false(countdown.frame(750))
 countdown.pause(750)
 countdown.resume(10000)
 assert_true(countdown.frame(10250))
 assert_eq(countdown.number, 2)
 countdown.frame(20000)
 assert_eq(countdown.number, 1)
 assert_false(countdown.completed)
 countdown.frame(21000)
 assert_true(countdown.completed)
