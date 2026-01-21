using UnityEngine;
using UnityEngine.AI;

public class PathFinder : MonoBehaviour
{
    public GameObject arrow;
    public GameObject target;
    private NavMeshAgent arowAgent;
    private LineRenderer line;
    private NavMeshPath path;

    private float traveledDistance = 0f;

    void Start()
    {
        arowAgent = arrow.GetComponent<NavMeshAgent>();
        arrow.transform.parent = null;
        path = new NavMeshPath();
        line = GetComponent<LineRenderer>();
    }

    void Update()
    {
        if (target != null)
        {
            arrow.SetActive(true);
            float distance = Vector3.Distance(arrow.transform.position, target.transform.position);
            arowAgent.SetDestination(target.transform.position);

            if (distance < 1f)
            {
                arowAgent.Warp(transform.position);
            }
        }
        else
        {
            arrow.SetActive(false);
        }

        if (arowAgent.hasPath && path != null)
        {
            NavMesh.CalculatePath(transform.position, target.transform.position, NavMesh.AllAreas, path);
            DrawPathByDistance(path.corners, arrow.transform.position);
        }
        else
        {
            line.positionCount = 0;
        }
    }

    void DrawPathByDistance(Vector3[] corners, Vector3 arrowPos)
    {
        if (corners.Length < 2) return;

        float totalDistance = 0f;
        int segmentIndex = 0;

        // Find which segment the arrow is on
        for (int i = 0; i < corners.Length - 1; i++)
        {
            float segmentLength = Vector3.Distance(corners[i], corners[i + 1]);
            if (Vector3.Distance(corners[i], arrowPos) <= segmentLength)
            {
                segmentIndex = i;
                break;
            }
            totalDistance += segmentLength;
        }

        // Draw line up to arrow's current position
        line.positionCount = segmentIndex + 2; // corners + arrow position
        for (int i = 0; i <= segmentIndex; i++)
        {
            line.SetPosition(i, corners[i]);
        }
        line.SetPosition(segmentIndex + 1, arrowPos);
    }
}
