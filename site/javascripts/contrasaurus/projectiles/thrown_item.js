function ThrownItem(I) {
  I = I || {};

  $.reverseMerge(I, {
    speed: 20,
    theta: -Math.PI/6,
    weaponName: "battleAxe"
  });

  $.reverseMerge(I, {
    collideDamage: 0,
    collisionType: "dinoBullet",
    explodeDamage: 20,
    radius: 30,
    rotation: 0,
    rotationalVelocity: Math.PI/10,
    shoot: $.noop,
    sprite: Sprite.load("images/weapons/" + I.weaponName + ".png")
  });

  function detonate() {
    if(I.active) {
      I.active = false;
      addGameObject(Explosion({
        collideDamage: I.explodeDamage,
        collisionType: "dinoBullet",
        x: I.x + 10,
        y: I.y
      }));
    }
  }

  var self = Bullet(I).extend({
    getTransform: GameObject.rotationGetTransform(I),
    
    land: function() {
      I.active = false;
    },
    before: {
      hit: function(other) {
        detonate();
      },
      update: function() {
        I.shoot(I);
      }
    },
    after: {
      hit: function(other) {
        if(other.bulletHitEffect) {
          other.bulletHitEffect(self);
        }
      },
      update: function() {
        GameObject.generateCheckBounds(I);
        I.rotation += I.rotationalVelocity;
        I.yVelocity += GRAVITY;
      }
    }
  });

  return self;
}
