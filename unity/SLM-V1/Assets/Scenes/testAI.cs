using UnityEngine;
using UnityEngine.AI;

public class TestAI : MonoBehaviour
{
    
    public NavMeshAgent navMeshAgent;
    public GameObject target;
    void Start()
    {
        navMeshAgent = GetComponent<NavMeshAgent>();
    }
    
    void Update()
    {
        if(target!=null)
            navMeshAgent.SetDestination(target.transform.position);
    }
}