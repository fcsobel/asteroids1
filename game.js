const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
canvas.width = window.innerWidth -50;
canvas.height = window.innerHeight -50;
let zoom = 1.0;
//canvas.width = (window.innerWidth) * zoom;
//canvas.height = (window.innerHeight) * zoom;
//canvas.width = (window.innerWidth - (50 * zoom)) * zoom;
//canvas.height = (window.innerHeight -(50 * zoom)) * zoom;
//context.scale(1/zoom,1/zoom);
//canvas.width = window.innerWidth * 2 -100;
//canvas.height = window.innerHeight * 2 -100;
context.scale(1 / zoom, 1 / zoom);

const SPEED = 0.05;
const ROTATION_SPEED = 0.05;
const FRICTION = 0.995;

class GameObject {
    constructor({ position, velocity, rotation, accelleration, friction, status }) {
        this.position = position;
        this.velocity = velocity;
        this.rotation = rotation;
        this.accelleration = accelleration;
        this.friction = friction ?? FRICTION;
        this.status = status ?? { amount: 0 };
    }    
    draw() {}
    update() {
        this.draw();

        // update velocity based on acceleration and rotation
        this.velocity.x += Math.cos(this.rotation) * this.accelleration;
        this.velocity.y += Math.sin(this.rotation) * this.accelleration;
        
        // friction
        this.velocity.x *= this.friction;
        this.velocity.y *= this.friction;

        // update postion based on velovity
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
    }
}

class Projectile extends GameObject {
    constructor({ position, velocity, rotation, accelleration, status }) {
        super({ position, velocity, rotation, accelleration, status });
        this.radius = 5;
    }
    draw() {
        context.save();
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        context.fillStyle = 'blue';
        context.fill();
        context.closePath();
        context.restore();
    }    
}


class Asteroid extends GameObject {
    constructor({ position, velocity, rotation, accelleration, friction, status }) {
        super({ position, velocity, rotation, accelleration, friction, status });
        this.radius = 50 * Math.random() + 10;        
    }

    draw() {
        context.save();
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
        
        context.strokeStyle = 'white';
        if (this.status.amount > 0)
        {
            console.log('yellow');
            context.fillStyle = 'yellow';
            console.log('status', this.status.amount);
        }
        else
        {
            console.log('no status', this.status.amount);
        }
        context.fill();
        context.stroke();
        context.closePath();
        //context.restore();
    }    
}

class Player extends GameObject {
    constructor({ position, velocity, rotation, accelleration }) {
        super({ position, velocity, rotation, accelleration });
        this.radius = 10;
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
        if (this.status.amount > 0)
        {
            context.strokeStyle = 'yellow';
        }
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
    position: { x: 300, y: 100 },
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
        case 'KeyZ':
            if (zoom == 1.0)
            {
                zoom = 2.0;
                context.scale(1 / zoom, 1 / zoom);    
            }
            else
            {
                zoom = 1.0;
                context.scale(2, 2);
            }
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

document.addEventListener('wheel', DoSomething);
document.addEventListener('mousewheel', DoSomething);
document.addEventListener('DOMMouseScroll', DoSomething);

function DoSomething(event)
{
    if (event.deltaY < 0.0)
    {
        //zoom = 2.0;
        zoom = zoom + 1;
        context.scale(1 / 2, 1 / 2);    
    }
    else
    {
        if (zoom > 1)
        {
            //zoom = 1.0;
            zoom = zoom - 1;
            context.scale(2, 2);
        }
    }
    return false;
}


const keys = {
    up: { pressed: false },
    right: { pressed: false },
    left: { pressed: false }
}

function CheckCollision(from, to)
{
    let circle1 = from.position;
    let circle2 = to.position;

    if (circle1.x <= 100) return false;
    if (circle1.y <= 100) return false;
    if (circle2.x <= 100) return false;
    if (circle2.y <= 100) return false;

    let xDifference = circle2.x - circle1.x;
    let yDifference = circle2.y - circle1.y;

    let distance = Math.sqrt(xDifference * xDifference + yDifference * yDifference);

    if (distance <= from.radius + to.radius)
    {
       return true;
    }
    return false;
}

// game loop
function animate() {
    window.requestAnimationFrame(animate);

    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width * zoom, canvas.height * zoom);


    for (let i = 0; i < players.length; i++) {
        let element = players[i];
        
        element.update();    

        for (let j = i + 1; j < players.length; j++) {
            let target = players[j];
        
            if (CheckCollision(element, target) == true)
            {       
                target.velocity.x = 0;              
                target.velocity.y = 0;              
                target.status.amount = 1;     
                element.status.amount = 1;     
                
                //target.velocity = { x: target.velocity.x + element.velocity.x, y: target.velocity.y +  element.velocity.y};
                //element.velocity = { x: element.velocity.x + target.velocity.x, y: element.velocity.y +  target.velocity.y};
                //element.status = 1;
            }
        }  
    }


    // players.forEach(element => {
    //     element.update();    
    //     players.forEach(target => {
    //         if (element != target)
    //         {
    //             if (CheckCollision(element, target) == true)
    //             {             
    //                 target.status = 1;
    //                 target.velocity = { x: target.velocity.x + element.velocity.x, y: target.velocity.y +  element.velocity.y};
    //                 //element.status = 1;
    //             }
    //         }
    //     });
    // });

    // Accelleration
    if (keys.up.pressed) { player.accelleration = SPEED;  } else { player.accelleration = 0; }

    // Rotation
    if (keys.right.pressed) { player.rotation += ROTATION_SPEED; }
    if (keys.left.pressed) { player.rotation -= ROTATION_SPEED; }
}

animate();

player2.fire();

window.setInterval(() => {
   
    let asteroid = new Asteroid(
        {
            position:
            {
                x:0,
                y:0
            },
            velocity:
            {
                x: 1,
                y: 1
            },
            rotation: 0,
            accelleration: 0,
            friction: 1
        });

    //console.log('add asterpoid', asteroid);

    players.push(asteroid);

}, 3000);




