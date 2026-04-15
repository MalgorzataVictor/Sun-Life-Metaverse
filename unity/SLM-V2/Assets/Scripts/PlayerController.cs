using UnityEngine;
using UnityEngine.InputSystem;

public class PlayerController : MonoBehaviour
{
    
    public InputActionReference interactActionRef1;
    public InputActionReference interactActionRef2;

    private InputAction interactAction1;
    private InputAction interactAction2;

    public Transform menuTransform;
    public Transform resetTransform;

    public GameObject menuScreen;
    public bool menuActive = false;

    void Start()
    {

        interactAction1 = interactActionRef1.ToInputAction();
        interactAction2 = interactActionRef2.ToInputAction();
    }
    
    void Awake()
    {
    }

    void Update()
    {
        if (interactAction1.WasPerformedThisFrame())
        {
            Debug.Log("Trigerring Menu...");
            menuActive = !menuActive;
            menuScreen.SetActive(menuActive);

            if (menuActive)
            {
            menuScreen.transform.position = menuTransform.position; 
        
            menuScreen.transform.eulerAngles = new Vector3( menuScreen.transform.eulerAngles.x, menuTransform.eulerAngles.y, menuScreen.transform.eulerAngles.z );
            }
            

        }

        if (interactAction2.WasPerformedThisFrame())
        {
            Debug.Log("Resetting Player Position...");
            transform.position = resetTransform.position;
            transform.rotation = resetTransform.rotation;
        }
    }
}