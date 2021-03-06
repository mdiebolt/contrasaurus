function Jetpack(I) {
  I = I || {};

  var fireSprite = Animation.load({
    url: "images/weapons/jetpack_fire.png",
    frames: 4,
    width: 91,
    height: 89,
    delay: 2
  });
  var jetpackSprite = Sprite.load("images/weapons/jetpack.png");

  var acceleration = 0;
  var keyDown = I.keyDown;

  var keyImpulses = {
    left: Point(-0.5, 0),
    right: Point(0.5, 0),
    up: Point(0, -1.25),
    down: Point()
  };

  $.reverseMerge(I, {
    attachment: "back",
    duration: -1,
    sprite: jetpackSprite
  });

  var self = Weapon(I).extend({
    data: $.noop,

    shoot: $.noop,

    update: function() {
      var impulse = Point(0, 0);
      $.each(keyImpulses, function(key, value) {
        if (keyDown[key]) {
          impulse = impulse.add(value);
        }
      });

      if (dino.airborne()) {
        var jetpackAngle = dino.jetpackAngle();
        if(jetpackAngle != 0) {
          jetpackAngle = jetpackAngle * 0.95;
        }

        if (impulse.x < 0) {
          acceleration = -0.2;
          jetpackAngle = (jetpackAngle - Math.PI/256).clamp(-Math.PI/12, Math.PI/12);
        } else if (impulse.x > 0) {
          acceleration = 0.2
          jetpackAngle = (jetpackAngle + Math.PI/256).clamp(-Math.PI/12, Math.PI/12);
        }

        dino.jetpackAngle(jetpackAngle);
        dino.xVelocity((dino.xVelocity() + impulse.x + acceleration).clamp(-10, 10));
      }

      if (dino.currentState() !== dino.states().bite) {
        dino.yVelocity((dino.yVelocity() + impulse.y).clamp(-10, 20));
      }

      if (impulse.y < 0) {
        if (dino.xVelocity() < 0) {
          dino.jetpackAngle((dino.jetpackAngle() + Math.PI/256).clamp(-Math.PI/12, Math.PI/12));
        }

        if (dino.xVelocity() > 0) {
          dino.jetpackAngle((dino.jetpackAngle() - Math.PI/256).clamp(-Math.PI/12, Math.PI/12));
        }
      }

      if (Math.abs(impulse.y < 0)) {
        dino.airborne(true);
      }

      if (Math.abs(impulse.x) > 0 || impulse.y < 0) {
        dino.jetpackOn(true);
      } else {
        dino.jetpackOn(false);
        acceleration = 0;
      }

      fireSprite.update();

      if(dino.jetpackOn() && dino.airborne()) {
        var p = dino.getTransform().transformPoint(Point(-20, 20).add(self.position()));
        var jetFlame = Bullet({
          collideDamage: 20,
          damageType: "fire",
          effectCount: 0,
          duration: 1,
          radius: 20,
          speed: 0,
          sprite: Sprite.EMPTY,
          x: p.x,
          y: p.y
        }).extend({
          before: {
            hit: function(other) {
              if(other.burn) {
                other.burn(jetFlame);
              }
            }
          }
        });

        addGameObject(jetFlame);
      }
    },

    after: {
      draw: function(canvas) {
        canvas.withTransform(self.getTransform(), function() {
          if (dino.jetpackOn() && dino.airborne()) {
            fireSprite.draw(canvas, -I.sprite.width/2, -I.sprite.height/2);
          }
        });
      }
    }
  });

  return self;
}
