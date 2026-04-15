using UnityEngine;

public class SensoryGate : MonoBehaviour
{    
    public SensoryZone zone;

    private void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            other.GetComponent<SensoryReceiver>().ReceiveSignal(zone);
        }
    }

}

 public enum SensoryZone
{
    None,
   Village,
   Collaboration,
   Library
}