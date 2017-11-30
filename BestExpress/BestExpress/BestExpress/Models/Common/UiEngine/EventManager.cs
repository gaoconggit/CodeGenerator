using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Best.Entities.UiEngine
{
    public class EventManager
    {
        public static EventManager GetInstance = new EventManager();
        private EventManager()
        {

        }
        public List<EventModel> GetEeventList
        {
            get
            {
                return new List<EventModel>()
                {
                    new EventModel() { Id=1, Name="click" },
                    new EventModel() { Id=2,Name="change"},
                    new EventModel() {  Id=3, Name="blur"},
                    new EventModel() { Id=4, Name="dbclick" },
                    new EventModel() {  Id=5,Name="callBack"},
                    new EventModel() {  Id=6,Name="preinit"}

                };
            }
        }
    }
}
