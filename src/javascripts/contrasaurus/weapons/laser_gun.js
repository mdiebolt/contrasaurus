function LaserGun(I) {
  I = I || {};

  var monocle = Animation.load("images/weapons/laser_eye.png", 4, 28, 26, 4);

  $.reverseMerge(I, {
    ammo: 256,
    attachment: "eye",
    cooldown: 12,
    exitPoints: [Point(5, 2)],
    name: "laserGun",
    power: 0,
    radius: 5,
    sprite: monocle
  });

  var self = Weapon(I).extend({
    generateProjectile: function(direction, position) {
      Sound.play("laserGun");

      return Bullet({
        speed: 20,
        collideDamage: 3,
        health: 5000,
        hitCircles: [{"x": -15, "y": 0, "radius": 3}, {"x": 0, "y": 0, "radius": 3}, {"x": 15, "y": 0, "radius": 3}],
        sprite: Sprite.load("images/projectiles/laser.png"),
        theta: direction,
        x: position.x,
        y: position.y
      });
    }
  });

  return self;
}
