import { mat4, quat, vec3, vec4 } from 'gl-matrix';
import { toRadians } from 'milque';

const UP = vec3.fromValues(0, 1, 0);
const HALF_PI = Math.PI / 2;
const PI2 = Math.PI * 2;

export function panTo(viewMatrix, x, y, z = 0, dt = 1)
{
    let position = vec3.create();
    mat4.getTranslation(position, viewMatrix);
    let translation = vec3.fromValues(
        (x - position[0]) * dt,
        (y - position[1]) * dt,
        (z - position[2]) * dt);
    mat4.translate(viewMatrix, viewMatrix, translation);
}

export function lookAt(viewMatrix, x, y, z = 0, dt = 1)
{
    let position = vec3.create();
    let rotation = quat.create();
    mat4.getTranslation(position, viewMatrix);
    mat4.getRotation(rotation, viewMatrix);
    let target = vec3.fromValues(x, y, z);
    
    mat4.lookAt(viewMatrix, position, target, UP);

    let targetRotation = quat.create();
    mat4.getRotation(viewMatrix, targetRotation);
    quat.slerp(rotation, rotation, targetRotation, dt);

    mat4.fromRotationTranslation(viewMatrix, rotation, position);
}

/**
 * Gets a directional ray in the world space from the given normalized
 * screen coordinates and camera matrices.
 * 
 * NOTE: In addition to some scaling, the y component from a pointer's
 * position usually has to be flipped to match the normalized screen
 * coordinate space, which assumes a range of [-1, 1] for both x and y,
 * where (0, 0) is the CENTER and (-1, -1) is the BOTTOM-LEFT of the
 * screen.
 * 
 * Typical Device Screen Coordinate Space:
 * 
 * (0,0)------------(w,0)
 *    |               |
 *    |   (w/2,h/2)   |
 *    |               |
 * (0,w)------------(w,h)
 * 
 * Normalized Screen Coordinate Space:
 * 
 * (-1,+1)---------(+1,+1)
 *    |               |
 *    |     (0,0)     |
 *    |               |
 * (-1,-1)---------(+1,-1)
 * 
 * @param {Number} normalizedScreenCoordX The X screen coordinate normalized to [-1, 1], where 0 is the left side of the screen.
 * @param {Number} normalizedScreenCoordY The Y screen coordinate normalized to [-1, 1], where 0 is the bottom side of the screen.
 * @param {mat4} projectionMatrix The projection matrix of the world camera.
 * @param {mat4} viewMatrix The view matrix of the world camera.
 * @returns {vec3} The normalized ray direction in the world space.
 */
export function screenToWorldRay(normalizedScreenCoordX, normalizedScreenCoordY, projectionMatrix, viewMatrix)
{
    // https://antongerdelan.net/opengl/raycasting.html
    // To homogeneous clip coords
    let v = vec4.fromValues(normalizedScreenCoordX, normalizedScreenCoordY, -1, 1);
    // To camera coords
    let m = mat4.create();
    mat4.invert(m, projectionMatrix);
    vec4.transformMat4(v, v, m);
    v[2] = -1;
    v[3] = 0;
    // To world coords
    mat4.invert(m, viewMatrix);
    vec4.transformMat4(v, v, m);
    // Normalized as directional ray
    let result = vec3.fromValues(v[0], v[1], v[2]);
    vec3.normalize(result, result);
    return result;
}

/**
 * Creates a camera controller that behaves like a traditional
 * first person camera. Pitch is restricted to prevent gimbal lock
 * and roll is ignored.
 * 
 * NOTE: Don't forget to lock your pointer, i.e. `canvas.requestPointerLock()`.
 */
export function createFirstPersonCameraController(opts = {})
{
    const { locky = false } = opts;

    return {
        position: vec3.create(),
        forward: vec3.fromValues(0, 0, -1),
        right: vec3.fromValues(1, 0, 0),
        up: vec3.fromValues(0, 1, 0),
        forwardAmount: 0,
        rightAmount: 0,
        upAmount: 0,
        pitch: 0,
        yaw: -90,
        look(dx, dy, dt = 1)
        {
            this.pitch = Math.min(89.9, Math.max(-89.9, this.pitch + dy * dt));
            this.yaw = (this.yaw + dx * dt) % 360;
            return this;
        },
        move(forward, right = 0, up = 0, dt = 1)
        {
            this.forwardAmount += forward * dt;
            this.rightAmount += right * dt;
            this.upAmount += up * dt;
            return this;
        },
        apply(out)
        {
            let {
                position,
                forward, right, up,
                forwardAmount, rightAmount, upAmount,
                pitch, yaw
            } = this;

            // Calculate forward and right vectors
            let rady = toRadians(yaw);
            let radp = toRadians(pitch);
            let cosy = Math.cos(rady);
            let cosp = Math.cos(radp);
            let siny = Math.sin(rady);
            let sinp = Math.sin(radp);
            let dx = cosy * cosp;
            let dy = sinp;
            let dz = siny * cosp;
            vec3.normalize(forward, vec3.set(forward, dx, dy, dz));
            vec3.normalize(right, vec3.cross(right, forward, up));

            let move = vec3.create();
            let prevY = position[1];
            // Move forward
            vec3.scale(move, forward, forwardAmount);
            vec3.add(position, position, move);
            // Move right
            vec3.scale(move, right, rightAmount);
            vec3.add(position, position, move);
            if (locky) position[1] = prevY;
            // Move up
            vec3.scale(move, up, upAmount);
            vec3.add(position, position, move);
            // Reset movement
            this.forwardAmount = 0;
            this.rightAmount = 0;
            this.upAmount = 0;
            
            let target = vec3.add(move, position, forward);
            mat4.lookAt(out, position, target, up);
            return out;
        }
    };
}