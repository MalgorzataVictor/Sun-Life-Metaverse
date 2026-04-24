using System.Collections;
using TMPro;
using UnityEngine;
public class SensoryReceiver : MonoBehaviour
{
   
    public TextMeshProUGUI displayText;
    public float waitBeforeFade = 2f;        
    public float fadeDuration = 1f;  
    private SensoryZone currentZone = SensoryZone.None;        

    public void ReceiveSignal(SensoryZone signalZone)
    {
        if (signalZone == currentZone)
            return; 
        currentZone = signalZone;
        displayText.text = $"You entered {signalZone} zone";
        SetAlpha(1f);
        StopAllCoroutines();
        StartCoroutine(FadeOutRoutine());
    }

    private IEnumerator FadeOutRoutine()
    {
        yield return new WaitForSeconds(waitBeforeFade);

        float elapsed = 0f;
        Color c = displayText.color;
        while (elapsed < fadeDuration)
        {
            elapsed += Time.deltaTime;
            c.a = Mathf.Lerp(1f, 0f, elapsed / fadeDuration);
            displayText.color = c;
            yield return null;
        }
        c.a = 0f;
        displayText.color = c;
    }

    private void SetAlpha(float alpha)
    {
        Color c = displayText.color;
        c.a = alpha;
        displayText.color = c;
    }
}