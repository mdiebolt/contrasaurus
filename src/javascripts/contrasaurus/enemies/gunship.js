function Gunship(I) {
  I = I || {};

  $.reverseMerge(I, {
    components: [],
    damageTable: {
      fire: 0.05,
    },
    health: 2000,
    hFlip: false,
    x: 550,
    xVelocity: 0,
    y: 240
  });

  var smallBulletSprite = Sprite.load("images/effects/enemybullet1_small.png");
  var bulletSprite = Sprite.load("images/projectiles/plane_bullet.png");

  var shipModel = Model.loadJSONUrl("data/gunship/hull.model.json");
  var lob1Model = Model.loadJSONUrl("data/gunship/lob1.model.json");
  var lob2Model = Model.loadJSONUrl("data/gunship/lob2.model.json");
  var bunkerModel = Model.loadJSONUrl("data/gunship/bunker.model.json");

  var states = {
    attack: State({
      duration: Infinity,
      model: shipModel,
      update: function() {
      }
    })
  };

  function ShipComponent(I) {
    I = I || {};

    $.reverseMerge(I, {
      bulletData: {
        sprite: smallBulletSprite
      },
      cooldown: 0,
      fireRate: 3,
      shot: {
        count: 1,
        dispersion: 0
      }
    });

    var self = GameObject(I).extend({
      getCircles: function() {
        return I.model.hitFrame();
      },

      shootFrom: function (attachment, bulletData, transform) {
        var shootPoint = I.model.attachment(attachment);

        if(shootPoint) {
          var t = transform.concat(self.getTransform());
          var direction = shootPoint.direction;

          var p = t.transformPoint(shootPoint);

          var tmpPoint = t.deltaTransformPoint(Point(Math.cos(direction), Math.sin(direction)));
          var theta = Point.direction(Point(0,0), tmpPoint);

          var dispersion = Circle.randomPoint(I.shot.dispersion);

          var bullet = Bullet($.extend({
            collisionType: "enemyBullet",
            theta: theta,
            x: p.x + dispersion.x,
            y: p.y + dispersion.y
          }, bulletData));

          addGameObject(bullet);

          return bullet;
        } else {
          return undefined;
        }
      },

      shoot: function(transform) {
        if(I.cooldown >= I.fireRate) {

          I.shot.count.times(function() {
            self.shootFrom("exit", I.bulletData, transform);
          });

          I.cooldown = 0;
        } else {
          I.cooldown += 1;
        }
      },

      before: {
        update: function() {
          I.sprite = I.model.animation;
        }
      }
    });

    return self;
  }

  I.components.push(ShipComponent({
    bulletData: {
      collideDamage: 5,
      sprite: bulletSprite,
      yAcceleration: GRAVITY / 2
    },
    fireRate: 99,
    model: lob1Model,
    shot: {
      count: 10,
      dispersion: 8,
    }
  }), ShipComponent({
    bulletData: {
      collideDamage: 5,
      sprite: bulletSprite,
      yAcceleration: GRAVITY / 2
    },
    fireRate: 33,
    model: lob2Model,
    shot: {
      count: 10,
      dispersion: 15,
    }
  }), ShipComponent({
    fireRate: 1,
    model: bunkerModel
  }));

  var boatTarget = Point(I.x - 25, I.y);
  I.currentState = states.attack;

  var self = Boss(I).extend({
    bulletHitEffect: Enemy.sparkSprayEffect,

    getTransform: function() {
      return Matrix.translation(I.x, I.y);
    },

    before: {
      update: function(position) {
        I.x = position.x + boatTarget.x + 20 * Math.sin(I.age/20);

        I.components.each(function(component) {
          component.update();
          //TODO: Shoot in a sequence, not constantly
          component.shoot(self.getTransform());
        });
      }
    }
  });

  self.attrReader('components');

  self.extend(Stateful(I));

  self.extend({
    after: {
      draw: function(canvas) {
        canvas.withTransform(self.getTransform(), function() {
          $.each(I.components, function(i, component) {
            component.draw(canvas);
          });
        });
      }
    }
  });

  self.bind('destroy', function() {
    addGameObject(EffectGenerator($.extend(self.position(), {
      radius: 100
    })));

    var effectI = self.position();

    var effect = Effect($.extend(effectI, {
      duration: 150,
      rotation: Math.PI / 2.25,
      sprite: shipModel.animation,
      velocity: Point(0, 0)
    })).extend({
      getTransform: GameObject.rotationGetTransform(effectI)
    });

    addGameObject(effect);
  });

  return self;
}
