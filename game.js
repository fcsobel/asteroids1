const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
canvas.width = window.innerWidth -50;
canvas.height = window.innerHeight -50;

class GameObject {
    constructor({ position, velocity, rotation, accelleration }) {
        this.position = position;
        this.velocity = velocity;
        this.rotation = rotation;
        this.accelleration = accelleration;
    }    
    draw() {}
    update() {
        this.draw();

        // update velocity based on acceleration and rotation
        this.velocity.x += Math.cos(this.rotation) * this.accelleration;
        this.velocity.y += Math.sin(this.rotation) * this.accelleration;
        
        // friction
        this.velocity.x *= FRICTION;
        this.velocity.y *= FRICTION;

        // update postion based on velovity
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Projectile extends GameObject {
    constructor({ position, velocity, rotation, accelleration }) {
        super({ position, velocity, rotation, accelleration });
    }
    draw() {
        context.save();
        context.beginPath();
        context.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2, false);
        context.fillStyle = 'blue';
        context.fill();
        context.closePath();
        context.restore();
    }    
}

class Player extends GameObject {
    constructor({ position, velocity, rotation, accelleration }) {
        super({ position, velocity, rotation, accelleration });
    }
    draw() {
        context.save();

        // rotate
        context.translate(this.position.x, this.position.y); // translate canvas location to center of player
        context.rotate(this.rotation);
        context.translate(-this.position.x, -this.position.y);  // translate canvas back to original position

        context.beginPath();
        context.arc(this.position.x, this.position.y, 5, 0, Math.PI * 2, false);
        context.fillStyle = 'red';
        context.fill();

        // create path for object
        
        context.moveTo(this.position.x + 30, this.position.y);
        context.lineTo(this.position.x - 10, this.position.y - 10);
        context.lineTo(this.position.x - 10, this.position.y + 10);
        context.closePath();

        // draw path
        context.strokeStyle = 'white';
        context.stroke();

        context.restore();
    }

    fire()
    {
        var missile =new Projectile({
             position : { 
                x : this.position.x + Math.cos(this.rotation) * 30, 
                y : this.position.y + Math.sin(this.rotation) * 30
            }, 
             velocity: { x : this.velocity.x, y : this.velocity.y },
             rotation: this.rotation,
             accelleration: SPEED * 3
        });
        
        players.push(missile);        
    }   
}

const player = new Player({
    position: { x: canvas.width / 2, y: canvas.height / 2 },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    accelleration: 0
});

const player2 = new Player({
    position: { x: 100, y: 100 },
    velocity: { x: 0, y: 0 },
    rotation: 0,
    accelleration: 0
});

const players = [player, player2];

window.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'ArrowUp':
            keys.up.pressed = true;
            break;
        case 'ArrowRight':
            keys.right.pressed = true;
            break;
        case 'ArrowLeft':
            keys.left.pressed = true;
            break;
    }
});
window.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'ArrowUp':
            keys.up.pressed = false;
            break;
        case 'ArrowRight':
            keys.right.pressed = false;
            break;
        case 'ArrowLeft':
            keys.left.pressed = false;
            break;
        case 'Space':
            player.fire();
            break;
        }
});

const keys = {
    up: { pressed: false },
    right: { pressed: false },
    left: { pressed: false }
}

const SPEED = 0.05;
const ROTATION_SPEED = 0.05;
const FRICTION = 0.995;

// game loop
function animate() {
    window.requestAnimationFrame(animate);

    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);

    players.forEach(element => {
        element.update();    
    });

    // player 1 controls
    //player.velocity.x = 0;
    //player.velocity.y = 0;

    if (keys.up.pressed) { player.accelleration = SPEED;  } else { player.accelleration = 0; }

    //if (keys.up.pressed) {
    //    player.velocity.x = Math.cos(player.rotation) * SPEED;
    //    player.velocity.y = Math.sin(player.rotation) * SPEED;
   // }
    //else{
    //    player.velocity.x *= FRICTION;
     //   player.velocity.y *= FRICTION;
    //}
    if (keys.right.pressed) { player.rotation += ROTATION_SPEED; }
    if (keys.left.pressed) { player.rotation -= ROTATION_SPEED; }
}

animate();

player2.fire();




