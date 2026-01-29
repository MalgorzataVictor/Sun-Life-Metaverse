using UnityEngine;
using UnityEngine.AI;
using System.Collections.Generic;

[RequireComponent(typeof(LineRenderer))]
public class PathFinder : MonoBehaviour
{
    [Header("References")]
    public GameObject arrow;

    [Header("Path Settings")]
    public float lineHeight = 0.12f;
    public float lineWidth = 0.22f;
    public int cornerSmoothing = 6;

    private NavMeshAgent arrowAgent;
    private LineRenderer line;
    private NavMeshPath path;

    private Vector3 target;

    void Awake()
    {
        arrowAgent = arrow.GetComponent<NavMeshAgent>();
        arrow.transform.parent = null;

        path = new NavMeshPath();
        line = GetComponent<LineRenderer>();

        // --- VR-safe LineRenderer setup ---
        line.useWorldSpace = true;
        line.alignment = LineAlignment.View;
        line.widthMultiplier = lineWidth;

        line.numCornerVertices = cornerSmoothing;
        line.numCapVertices = cornerSmoothing;

        line.shadowCastingMode = UnityEngine.Rendering.ShadowCastingMode.Off;
        line.receiveShadows = false;

        if (line.material == null)
            line.material = new Material(Shader.Find("Sprites/Default"));
    }

    void Update()
    {
        if (target == Vector3.zero)
        {
            arrow.SetActive(false);
            line.positionCount = 0;
            return;
        }

        arrow.SetActive(true);
        arrowAgent.SetDestination(target);

        NavMesh.CalculatePath(transform.position, target, NavMesh.AllAreas, path);

        if (path.corners.Length >= 2)
            DrawPathToArrow(path.corners, arrow.transform.position);
        else
            line.positionCount = 0;

        if (Vector3.Distance(transform.position, target) < 2f)
            target = Vector3.zero;
    }

    void DrawPathToArrow(Vector3[] corners, Vector3 arrowPos)
    {
        List<Vector3> points = new List<Vector3>();

        int closestSegment = 0;
        float closestDist = float.MaxValue;

        for (int i = 0; i < corners.Length - 1; i++)
        {
            Vector3 projected = ProjectPointOnLineSegment(
                corners[i], corners[i + 1], arrowPos);

            float dist = Vector3.Distance(arrowPos, projected);
            if (dist < closestDist)
            {
                closestDist = dist;
                closestSegment = i;
            }
        }

        // Add corners up to the arrow
        for (int i = 0; i <= closestSegment; i++)
            points.Add(Lift(corners[i]));

        // Add arrow cutoff point
        Vector3 arrowPoint = ProjectPointOnLineSegment(
            corners[closestSegment],
            corners[closestSegment + 1],
            arrowPos);

        points.Add(Lift(arrowPoint));

        line.positionCount = points.Count;
        line.SetPositions(points.ToArray());
    }

    Vector3 Lift(Vector3 p)
    {
        return p + Vector3.up * lineHeight;
    }

    Vector3 ProjectPointOnLineSegment(Vector3 a, Vector3 b, Vector3 point)
    {
        Vector3 ab = b - a;
        float t = Vector3.Dot(point - a, ab) / Vector3.Dot(ab, ab);
        t = Mathf.Clamp01(t);
        return a + ab * t;
    }

    public void SetTarget(Vector3 targetPosition)
    {
        target = targetPosition;
        arrowAgent.Warp(transform.position);
    }
}
