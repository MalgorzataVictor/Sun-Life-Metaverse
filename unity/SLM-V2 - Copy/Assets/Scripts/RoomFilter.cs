using UnityEngine;
using System.Linq;
using System.Collections.Generic;
using TMPro;
using UnityEngine.InputSystem;
using System;


public class RoomFilter : MonoBehaviour
{

    public SortedDictionary<string, RoomLocation> roomDict = new();
    public TMP_InputField roomInput;
    public TMP_Dropdown searchDrop;
    public PathFinder pathFinder;

    void Start()
    {

        searchDrop.ClearOptions();
        GameObject[] roomInfos = GameObject.FindGameObjectsWithTag("RoomInfo");
        foreach (GameObject go in roomInfos)
        {
            RoomLocation roomDetails = go.GetComponent<RoomLocation>();
            roomDict.Add(roomDetails.roomCode, roomDetails);

            TMP_Dropdown.OptionData optionData = new()
            {
                text = roomDetails.roomCode
            };
            searchDrop.options.Add(optionData);
        }
        searchDrop.value = 0;
        searchDrop.RefreshShownValue();
    }


    public void FilterRoomList()
    {
        String searchTerm = roomInput.text.ToLower();
        searchDrop.ClearOptions();

        foreach (KeyValuePair<string, RoomLocation> kvp in roomDict)
        {

            if (kvp.Value.roomCode.ToLower().StartsWith(searchTerm) ||
             kvp.Value.roomName.ToLower().StartsWith(searchTerm))
            {
                TMP_Dropdown.OptionData optionData = new()
                {
                    text = kvp.Value.roomCode
                };
                searchDrop.options.Add(optionData);
            }


        }

        searchDrop.value = 0;
        searchDrop.RefreshShownValue();

    }


    public void SearchRoom()
    {
        String dropDownValue = searchDrop.options[searchDrop.value].text;
        RoomLocation foundRoom = roomDict[dropDownValue];


        pathFinder.SetTarget(foundRoom.position);

        gameObject.SetActive(false);

    }
}
