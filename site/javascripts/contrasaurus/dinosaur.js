function Dinosaur() {
  var width = 128;
  var height = 128;

  var jetpack = Jetpack();

  var x = (CANVAS_WIDTH - width) / 2;
  var y = 150;

  var parasailing = false;
  var boss = false;
  var airborne = true;

  var weapons = [];
  var activeWeapons = [];

  var pitchAngle = 0;

  var walkTile = loadAnimation("images/contrasaurus/walk.png", 8, 283, 163, 3);
  var parasailTile = Sprite.load("images/levels/parasail/parasail.png");
  
  var I = {
    x: x,
    y: y,
    width: width,
    height: height,
    color: "#00F",
    health: 500,
    radius: 72,
    xVelocity: 1,
    yVelocity: 6,
    collideDamage: 2,
    collisionType: "dino",
    hitCircles: [{"x":87,"y":-52,"radius":27},{"x":13,"y":-10,"radius":37},{"x":117,"y":-45,"radius":24},{"x":50,"y":-38,"radius":19},{"x":-27,"y":-12,"radius":25},{"x":-60,"y":-2,"radius":18},{"x":-89,"y":5,"radius":14},{"x":-114,"y":10,"radius":12}],
    sprite: walkTile
  };

  var accessories = [];

  var lastDirection = I.xVelocity;

  var healthMax = I.health;

  function heal(amount) {
    I.health = Math.clamp(I.health + amount, 0, healthMax);
  }

  var self = GameObject(I).extend({
    addAccessory: function(accessory) {
      accessories.push(accessory);
    },

    addWeapon: function(weapon) {
      weapons.push(weapon.dino(self));
    },

    airborne: function() {
      return airborne;
    },

    boss: function(newValue) {
      if(newValue != undefined) {
        boss = newValue;
      } else {
        return boss;
      }
      return self;
    },

    bulletHitEffect: Enemy.bloodSprayEffect,

    components: function() {
      return weapons;
    },

    getTransform: function() {
      var transform;

      if (lastDirection <= 0 && !parasailing) {
        transform = Matrix.HORIZONTAL_FLIP;
      } else {
        transform = Matrix.IDENTITY;
      }
      
      if(airborne) {
        transform = transform.concat(Matrix.rotation(pitchAngle));
      }

      return transform.translate(I.x, I.y);
    },

    heal: heal,

    bump: function() {
      //I.xVelocity = -I.xVelocity;
    },

    draw: function(canvas) {

      canvas.withTransform(self.getTransform(), function() {
        if(parasailing) {
          parasailTile.draw(canvas, -100, -100);
        }

        walkTile.draw(canvas,
          -walkTile.width/2,
          -walkTile.height/2
        );

        $.each(accessories, function(i, accessory) {
          accessory.draw(canvas);
        });

        if(!parasailing) {
          jetpack.draw(canvas);
        }

        $.each(weapons, function(i, weapon) {
          weapon.draw(canvas);
        });
      });

      if (GameObject.DEBUG_HIT) {
        self.drawHitCircles(canvas);
      }
    },

    land: function(h) {
      if(I.yVelocity >= 0) {
        I.y = h - (I.radius + 1);
        I.yVelocity = 0;
        I.xVelocity = (Math.abs(I.xVelocity) / I.xVelocity) * 5;
        airborne = false;
      }
    },

    parasailing: function(newValue) {
      if(newValue != undefined) {
        parasailing = newValue;
        if(parasailing == true) {
          I.x = (CANVAS_WIDTH - width) / 2;
          I.y = 150;
          pitchAngle = 0;
          airborne = true;
        }
        return self;
      } else {
        return parasailing;
      }
    },

    after: {
      update: function(position) {
        jetpack.update();

        if(parasailing) {
          I.xVelocity = Math.sin(I.age);
          I.yVelocity = Math.cos(I.age/2);
        } else {
          if (jetpack.engaged()) {
            airborne = true;
            currentLevel.tiltAmount(6);
            I.xVelocity = 7;
          } else {
            currentLevel.tiltAmount(1);
          }

          if (boss) {
            currentLevel.tiltAmount(0);
            I.xVelocity = 1;
          }

          if (airborne && jetpack.engaged()) {
            I.yVelocity = -1;
          }

          if (!(jetpack.engaged()) && airborne) {
            I.yVelocity = 6;
          }

          if (!airborne) {
            lastDirection = I.xVelocity;
          } else {
            pitchAngle += Math.PI / 24;
          }
        }

        $.each(weapons, function(i, weapon) {
          weapon.update(self);

          if(weapon.active()) {
            activeWeapons.push(weapon);
          }
        });

        weapons = activeWeapons;
        activeWeapons = [];

        // Stay in screen
        if (I.x < position.x + I.radius) {
          I.x = position.x + I.radius;
          I.xVelocity = Math.abs(I.xVelocity);
        } else if (I.x > position.x + CANVAS_WIDTH - I.radius) {
          I.x = position.x + CANVAS_WIDTH - I.radius;
          I.xVelocity = -Math.abs(I.xVelocity);
        }

        // Wiggle in the air
        if (airborne) {
          I.xVelocity += (Math.random() - 0.5) * 3;
          I.xVelocity = I.xVelocity * 0.9;
        }
      }
    }
  });

  self.addWeapon(Shield());

  return self;
}
