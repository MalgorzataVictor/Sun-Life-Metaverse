using UnityEngine;
using UnityEngine.AI;
using System.Collections.Generic;

[RequireComponent(typeof(LineRenderer))]
public class PathFinder : MonoBehaviour
{
    public GameObject arrow;
    public GameObject target;
    private NavMeshAgent arowAgent;
    private LineRenderer line;
    private NavMeshPath path;

    public int pointsPerSegment = 30; // More = smoother

    private Vector3[] smoothPath;

    void Start()
    {
        arowAgent = arrow.GetComponent<NavMeshAgent>();
        arrow.transform.parent = null;
        path = new NavMeshPath();
        line = GetComponent<LineRenderer>();

        line.widthMultiplier = 0.5f;
        if (line.material == null)
            line.material = new Material(Shader.Find("Sprites/Default"));
    }

    void Update()
    {
        if (target == null)
        {
            arrow.SetActive(false);
            line.positionCount = 0;
            return;
        }

        arrow.SetActive(true);
        arowAgent.SetDestination(target.transform.position);

        if (Vector3.Distance(arrow.transform.position, target.transform.position) < 1f)
            arowAgent.Warp(transform.position);

        if (arowAgent.hasPath)
        {
            NavMesh.CalculatePath(transform.position, target.transform.position, NavMesh.AllAreas, path);

            if (path.corners.Length >= 2)
            {
                smoothPath = GenerateSmoothPath(path.corners, pointsPerSegment);
                DrawLineToArrow(smoothPath, arrow.transform.position);
            }
        }
        else
        {
            line.positionCount = 0;
        }
    }

    void DrawLineToArrow(Vector3[] pathPoints, Vector3 arrowPos)
    {
        if (pathPoints.Length < 2) return;

        List<Vector3> pointsToDraw = new List<Vector3>();
        pointsToDraw.Add(pathPoints[0]); // Always start at first point

        // Find closest segment to the arrow
        int segmentIndex = 0;
        float minDist = float.MaxValue;
        for (int i = 0; i < pathPoints.Length - 1; i++)
        {
            Vector3 start = pathPoints[i];
            Vector3 end = pathPoints[i + 1];

            // Project arrow onto segment
            Vector3 projected = ProjectPointOnLineSegment(start, end, arrowPos);
            float dist = Vector3.Distance(arrowPos, projected);
            if (dist < minDist)
            {
                minDist = dist;
                segmentIndex = i;
            }
        }

        // Add all points up to segmentIndex
        for (int i = 1; i <= segmentIndex; i++)
            pointsToDraw.Add(pathPoints[i]);

        // Interpolate along the segment for the arrow
        Vector3 arrowPoint = ProjectPointOnLineSegment(pathPoints[segmentIndex], pathPoints[segmentIndex + 1], arrowPos);
        pointsToDraw.Add(arrowPoint);

        line.positionCount = pointsToDraw.Count;
        line.SetPositions(pointsToDraw.ToArray());
    }

    // Projects a point onto a line segment
    Vector3 ProjectPointOnLineSegment(Vector3 a, Vector3 b, Vector3 point)
    {
        Vector3 ab = b - a;
        float t = Vector3.Dot(point - a, ab) / Vector3.Dot(ab, ab);
        t = Mathf.Clamp01(t);
        return a + ab * t;
    }

    Vector3[] GenerateSmoothPath(Vector3[] corners, int pointsPerSegment)
    {
        List<Vector3> smoothPoints = new List<Vector3>();

        for (int i = 0; i < corners.Length - 1; i++)
        {
            Vector3 p0 = i == 0 ? corners[i] : corners[i - 1];
            Vector3 p1 = corners[i];
            Vector3 p2 = corners[i + 1];
            Vector3 p3 = (i + 2 < corners.Length) ? corners[i + 2] : corners[i + 1];

            for (int j = 0; j < pointsPerSegment; j++)
            {
                float t = j / (float)pointsPerSegment;
                smoothPoints.Add(GetCatmullRomPosition(t, p0, p1, p2, p3));
            }
        }

        smoothPoints.Add(corners[corners.Length - 1]);
        return smoothPoints.ToArray();
    }

    Vector3 GetCatmullRomPosition(float t, Vector3 p0, Vector3 p1, Vector3 p2, Vector3 p3)
    {
        float t2 = t * t;
        float t3 = t2 * t;
        return 0.5f * ((2f * p1) +
                       (-p0 + p2) * t +
                       (2f * p0 - 5f * p1 + 4f * p2 - p3) * t2 +
                       (-p0 + 3f * p1 - 3f * p2 + p3) * t3);
    }
}
