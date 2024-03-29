/// import base

$.Game_Actor_gainHp = Game_Actor.prototype.gainHp
Game_Actor.prototype.gainHp = function gainHp(value) {
  $.Game_Actor_gainHp.call(this, value)
  FUNC.foo();
}
