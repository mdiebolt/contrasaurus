function Weapon(I) {
  I = I || {};

  $.reverseMerge(I, {
    age: 0,
    power: 0,
    radius: 5,
    theta: 0,
    x: 0,
    y: 0
  });

  var self = GameObject(I).extend({
    power: function(value) {
        if (value === undefined) {
          return I.power;
        } else {
          I.power += value;
          return self;
        }
      },

    shoot: function(theta, position, transform) {
      if (rand(100) < I.power) {
        addGameObject(Bullet(theta, position));
      }
    }
  });
  return self;
}
