using UnityEngine;
using UnityEngine.InputSystem;

public class PlayerMovement : MonoBehaviour
{
    
    public InputActionReference interactActionRef;
    private InputAction interactAction;

    public Transform menuTransform;

    public GameObject menuScreen;
    public bool menuActive = false;

    void Start()
    {

        interactAction = interactActionRef.ToInputAction();
    }
    
    void Awake()
    {
    }

    void Update()
    {
        if (interactAction.WasPerformedThisFrame())
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
    }
}