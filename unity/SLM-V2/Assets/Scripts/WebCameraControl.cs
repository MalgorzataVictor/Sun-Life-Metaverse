

using System;
using UnityEngine;
using UnityEngine.InputSystem;

public class CameraOrbitController : MonoBehaviour
{
    [Header("References")]
    public GameObject targetCamera;
    public Transform target;

    [Header("Orbit Settings")]
    public float distance = 5.0f;
    public float sensitivity = 0.2f;
    public float moveSpeed = 0.2f;
    public Vector2 pitchLimits = new Vector2(-30, 60);

    [Header("Zoom Settings")]
    public float zoomSensitivity = 0.01f;
    public Vector2 zoomLimits = new Vector2(2f, 15f);

    private InputAction interactAction;
    private InputAction lookAction;
    private InputAction zoomAction;
    private InputAction moveAction;
    private Vector2 rotation;

    private void Awake()
    {
        interactAction = InputSystem.actions.FindAction("Interact");
        lookAction = InputSystem.actions.FindAction("Look");
        zoomAction = InputSystem.actions.FindAction("Zoom");
        moveAction = InputSystem.actions.FindAction("MoveMouse");

        if (targetCamera == null) targetCamera = Camera.main.gameObject;
    }

    private void OnEnable()
    {
        interactAction?.Enable();
        lookAction?.Enable();
        zoomAction?.Enable();
        moveAction?.Enable();
    }

    private void LateUpdate()
    {
        if (target == null || targetCamera == null) return;

        // 1. Handle Orbit (when Interact button is held)
        if (interactAction != null && interactAction.IsPressed())
        {
            Vector2 lookInput = lookAction.ReadValue<Vector2>();
            rotation.x += lookInput.x * sensitivity * Time.deltaTime;
            rotation.y -= lookInput.y * sensitivity * Time.deltaTime;
            rotation.y = Mathf.Clamp(rotation.y, pitchLimits.x, pitchLimits.y);
        }



        // 4. Movement
        if (moveAction != null && moveAction.IsPressed())
        {
            Vector2 lookInput = lookAction.ReadValue<Vector2>();
            Vector3 right = targetCamera.transform.right;
            Vector3 up = targetCamera.transform.up;

            Vector3 nposition = target.position - (right * lookInput.x + up * lookInput.y) * moveSpeed * Time.deltaTime;
            nposition.x = Mathf.Clamp(nposition.x,-60,50);
            nposition.y = Mathf.Clamp(nposition.y,-1,25);
            nposition.z = Mathf.Clamp(nposition.z,-50,40);

            target.position = nposition;
        }


        // 2. Handle Zoom (independent of Interact button)
        if (zoomAction != null)
        {
            float scrollValue = zoomAction.ReadValue<Vector2>().y;

            if (Mathf.Abs(scrollValue) > 0.01f)
            {

                distance -= scrollValue * zoomSensitivity * Time.deltaTime;
                distance = Mathf.Clamp(distance, zoomLimits.x, zoomLimits.y);
            }
        }

        // 3. Apply position and rotation
        Quaternion rot = Quaternion.Euler(rotation.y, rotation.x, 0);
        targetCamera.transform.position = target.position - (rot * Vector3.forward * distance);
        targetCamera.transform.LookAt(target.position);

        target.transform.rotation = targetCamera.transform.rotation;

    }

}
