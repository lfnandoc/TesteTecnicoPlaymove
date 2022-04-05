using System.Data;

namespace TesteTecnicoPlaymove.Entities
{
    public interface IEntity
    {
        public abstract int Id { get; set; }

        public abstract void MapEntity(DataRow dataRow);
    }
}
