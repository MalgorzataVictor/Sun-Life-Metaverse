using UnityEngine;
using System.Linq;
using System.Collections.Generic;

public class RoomFilter : MonoBehaviour
{
    
public List<RoomLocation> roomList;
    void Start()
    {
        GameObject[] roomInfos = GameObject.FindGameObjectsWithTag("RoomInfo");

        roomList = roomInfos
        .Select(x => x.GetComponent<RoomLocation>())
        .Where(component => component != null)
        .ToList();
        
    }

    
    void Update()
    {
        
    }
}
